use crate::{
    waqf_utils,
    waqf_types::{WaqfData},
};
use junobuild_satellite::{OnSetDocContext, AssertSetDocContext, AssertDeleteDocContext};
use junobuild_utils::{decode_doc_data};
use serde::{Serialize, Deserialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize)]
pub enum WaqfAction {
    Create,
    Update,
    Pause,
    Complete,
    AllocationChange,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WaqfAudit {
    pub waqf_id: String,
    pub action: WaqfAction,
    pub performed_by: String,
    pub timestamp: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum WaqfValidationError {
    InvalidDonorInfo(String),
    InvalidAllocation(String),
    IllegalStatusTransition(String),
    FinancialError(String),
    PermissionDenied(String),
}

impl fmt::Display for WaqfValidationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidDonorInfo(msg) => write!(f, "Donor info: {}", msg),
            Self::InvalidAllocation(msg) => write!(f, "Allocation: {}", msg),
            Self::IllegalStatusTransition(msg) => write!(f, "Status: {}", msg),
            Self::FinancialError(msg) => write!(f, "Finance: {}", msg),
            Self::PermissionDenied(msg) => write!(f, "Permission: {}", msg),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WaqfValidationResult {
    pub valid: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<Vec<WaqfValidationError>>,
}

// Validate that waqf creators can only update specific fields
fn validate_creator_field_restrictions(
    previous: &WaqfData, 
    updated: &WaqfData, 
    caller: &str
) -> std::result::Result<(), String> {
    // IMMUTABLE FIELDS - Cannot be changed by ANYONE (including admins)
    // These fields are sacred to the Islamic Waqf principles
    if previous.waqf_asset != updated.waqf_asset {
        ic_cdk::println!(
            "SECURITY VIOLATION: {} attempted to modify immutable waqf_asset from {} to {} for waqf: {}",
            caller, previous.waqf_asset, updated.waqf_asset, updated.id
        );
        return Err(
            "FORBIDDEN: Waqf asset (principal endowment) is immutable and cannot be changed after creation. \
            This preserves the integrity of the Islamic Waqf principle where the principal must remain intact forever.".to_string()
        );
    }
    
    if previous.created_by != updated.created_by {
        ic_cdk::println!(
            "SECURITY VIOLATION: {} attempted to modify immutable created_by from {} to {} for waqf: {}",
            caller, previous.created_by, updated.created_by, updated.id
        );
        return Err("FORBIDDEN: Creator identity cannot be changed after waqf creation.".to_string());
    }
    
    if previous.created_at != updated.created_at {
        ic_cdk::println!(
            "SECURITY VIOLATION: {} attempted to modify immutable created_at for waqf: {}",
            caller, updated.id
        );
        return Err("FORBIDDEN: Creation timestamp cannot be modified.".to_string());
    }
    
    // Only validate remaining fields if caller is the original creator
    // Admins and system hooks can update these fields if needed
    if previous.created_by != caller {
        return Ok(()); // Allow admin/system operations on non-immutable fields
    }
    
    // Check for restricted field changes (creator restrictions only)
    // Note: financial fields ONLY updated by donations are allowed (system hooks)
    let financial_only_update = 
        previous.financial != updated.financial &&
        previous.selected_causes == updated.selected_causes &&
        previous.status == updated.status &&
        previous.is_donated == updated.is_donated &&
        previous.notifications == updated.notifications &&
        previous.reporting_preferences == updated.reporting_preferences;
    
    // If only financial changed, it's likely from a donation hook - allow it
    if financial_only_update {
        ic_cdk::println!(
            "INFO: Financial-only update detected for waqf: {} (likely from donation hook)",
            updated.id
        );
        return Ok(());
    }
    
    let restricted_changes: Vec<&str> = [
        ("selected_causes", previous.selected_causes != updated.selected_causes),
        ("status", previous.status != updated.status),
        ("is_donated", previous.is_donated != updated.is_donated),
        ("notifications", previous.notifications != updated.notifications),
        ("reporting_preferences", previous.reporting_preferences != updated.reporting_preferences),
        ("financial", previous.financial != updated.financial),
        ("last_contribution_date", previous.last_contribution_date != updated.last_contribution_date),
        ("next_contribution_date", previous.next_contribution_date != updated.next_contribution_date),
        ("next_report_date", previous.next_report_date != updated.next_report_date),
    ]
    .iter()
    .filter_map(|(field, changed)| if *changed { Some(*field) } else { None })
    .collect();
    
    // Reject if restricted fields were modified by creator
    if !restricted_changes.is_empty() {
        ic_cdk::println!(
            "SECURITY: Creator {} attempted to modify restricted fields: {} for waqf: {}",
            caller, restricted_changes.join(", "), updated.id
        );
        
        return Err(format!(
            "Waqf creators can only update name, description, and donor fields. Unauthorized changes: {}",
            restricted_changes.join(", ")
        ));
    }
    
    // Log allowed changes
    let allowed_changes: Vec<&str> = [
        ("name", previous.name != updated.name),
        ("description", previous.description != updated.description),
        ("donor.name", previous.donor.name != updated.donor.name),
        ("donor.email", previous.donor.email != updated.donor.email),
        ("donor.phone", previous.donor.phone != updated.donor.phone),
        ("donor.address", previous.donor.address != updated.donor.address),
    ]
    .iter()
    .filter_map(|(field, changed)| if *changed { Some(*field) } else { None })
    .collect();
    
    if !allowed_changes.is_empty() {
        ic_cdk::println!(
            "INFO: Creator {} updated allowed fields: {} for waqf: {}",
            caller, allowed_changes.join(", "), updated.id
        );
    }
    
    Ok(())
}

// Validate minimum initial capital for new waqf creation
fn validate_minimum_waqf_asset(waqf: &WaqfData) -> std::result::Result<(), String> {
    const MIN_WAQF_AMOUNT: f64 = 100.0; // Minimum $100 for meaningful waqf
    
    if waqf.waqf_asset < MIN_WAQF_AMOUNT {
        let error_msg = format!(
            "Minimum initial capital required: ${:.2}. Provided: ${:.2}. A waqf requires a meaningful contribution to create lasting impact.",
            MIN_WAQF_AMOUNT,
            waqf.waqf_asset
        );
        
        ic_cdk::println!(
            "VALIDATION: Waqf creation rejected - insufficient initial capital: ${:.2} for waqf: {} by creator: {}",
            waqf.waqf_asset, waqf.name, waqf.created_by
        );
        
        return Err(error_msg);
    }
    
    ic_cdk::println!(
        "INFO: Waqf creation accepted - initial capital: ${:.2} for waqf: {} by creator: {}",
        waqf.waqf_asset, waqf.name, waqf.created_by
    );
    
    Ok(())
}

// Validate hybrid allocations sum to 100%
fn validate_hybrid_allocations(allocations: &[crate::waqf_types::HybridCauseAllocation]) -> std::result::Result<(), String> {
    for allocation in allocations {
        let total = allocation.allocations.permanent.unwrap_or(0.0)
            + allocation.allocations.temporary_consumable.unwrap_or(0.0)
            + allocation.allocations.temporary_revolving.unwrap_or(0.0);
        
        // Allow for floating point errors
        if (total - 100.0).abs() > 0.01 {
            return Err(format!(
                "Hybrid allocations for cause {} must sum to 100%, got {:.2}%",
                allocation.cause_id, total
            ));
        }
    }
    Ok(())
}

// Validate waqf type and corresponding details
fn validate_waqf_type_and_details(waqf: &WaqfData) -> std::result::Result<(), String> {
    use crate::waqf_types::WaqfType;
    
    match &waqf.waqf_type {
        WaqfType::Permanent => {
            // Permanent waqf should not have temporary details
            if waqf.consumable_details.is_some() {
                return Err("Permanent waqf cannot have consumable details".to_string());
            }
            if waqf.revolving_details.is_some() {
                return Err("Permanent waqf cannot have revolving details".to_string());
            }
            if waqf.is_hybrid {
                return Err("Permanent waqf cannot be hybrid".to_string());
            }
            ic_cdk::println!("INFO: Permanent waqf validated - {}", waqf.name);
        },
        
        WaqfType::TemporaryConsumable => {
            // Consumable waqf must have consumable details
            let consumable = waqf.consumable_details.as_ref()
                .ok_or("Consumable waqf must have consumable details")?;
            
            // Validate spending schedule
            match consumable.spending_schedule.as_str() {
                "immediate" | "phased" | "milestone-based" | "ongoing" => {},
                _ => return Err(format!(
                    "Invalid spending schedule: {}", consumable.spending_schedule
                )),
            }
            
            // Validate schedule-specific requirements
            match consumable.spending_schedule.as_str() {
                "milestone-based" => {
                    // Milestone-based must have milestones
                    if consumable.milestones.is_none() || consumable.milestones.as_ref().unwrap().is_empty() {
                        return Err("Milestone-based spending requires at least one milestone".to_string());
                    }
                },
                "phased" => {
                    // Phased should have dates or minimum distribution
                    if consumable.start_date.is_none() && consumable.end_date.is_none() 
                        && consumable.minimum_monthly_distribution.is_none() {
                        return Err("Phased spending requires either time boundaries or minimum distribution amount".to_string());
                    }
                },
                "ongoing" => {
                    // Ongoing should have minimum distribution or target criteria
                    if consumable.minimum_monthly_distribution.is_none() 
                        && consumable.target_amount.is_none() 
                        && consumable.target_beneficiaries.is_none() {
                        return Err("Ongoing spending requires minimum distribution or target criteria".to_string());
                    }
                },
                _ => {} // immediate has no specific requirements
            }
            
            // Validate date logic if both dates are present
            if let (Some(start), Some(end)) = (&consumable.start_date, &consumable.end_date) {
                // Basic ISO format check - we can't parse dates in Rust satellite easily
                // But we can check they're not empty
                if start.is_empty() || end.is_empty() {
                    return Err("Start and end dates cannot be empty".to_string());
                }
            }
            
            // Validate target amounts if present
            if let Some(target) = consumable.target_amount {
                if target <= 0.0 {
                    return Err("Target amount must be positive".to_string());
                }
            }
            
            if let Some(target) = consumable.target_beneficiaries {
                if target == 0 {
                    return Err("Target beneficiaries must be at least 1".to_string());
                }
            }
            
            if let Some(min_dist) = consumable.minimum_monthly_distribution {
                if min_dist <= 0.0 {
                    return Err("Minimum monthly distribution must be positive".to_string());
                }
            }
            
            ic_cdk::println!(
                "INFO: Consumable waqf validated - {} (Schedule: {})",
                waqf.name, consumable.spending_schedule
            );
        },
        
        WaqfType::TemporaryRevolving => {
            // Revolving waqf must have revolving details
            let revolving = waqf.revolving_details.as_ref()
                .ok_or("Revolving waqf must have revolving details")?;
            
            // Validate lock period (minimum 1 month, maximum 20 years)
            if revolving.lock_period_months < 1 {
                return Err("Lock period must be at least 1 month".to_string());
            }
            if revolving.lock_period_months > 240 {
                return Err("Lock period cannot exceed 240 months (20 years)".to_string());
            }
            
            // Validate return method
            match revolving.principal_return_method.as_str() {
                "lump_sum" | "installments" => {},
                _ => return Err(format!(
                    "Invalid principal return method: {}", revolving.principal_return_method
                )),
            }
            
            // If installments, must have schedule
            if revolving.principal_return_method == "installments" && revolving.installment_schedule.is_none() {
                return Err("Installment method requires installment schedule".to_string());
            }
            
            // Validate penalty if present
            if let Some(penalty) = revolving.early_withdrawal_penalty {
                if penalty < 0.0 || penalty > 1.0 {
                    return Err(format!(
                        "Early withdrawal penalty must be between 0 and 1, got {}", penalty
                    ));
                }
            }
            
            ic_cdk::println!(
                "INFO: Revolving waqf validated - {} (Lock: {} months, Return: {})",
                waqf.name, revolving.lock_period_months, revolving.principal_return_method
            );
        },
        
        WaqfType::Hybrid => {
            // Hybrid waqf must have hybrid allocations
            if !waqf.is_hybrid {
                return Err("Hybrid waqf type must have is_hybrid flag set to true".to_string());
            }
            
            let allocations = waqf.hybrid_allocations.as_ref()
                .ok_or("Hybrid waqf must have hybrid allocations")?;
            
            if allocations.is_empty() {
                return Err("Hybrid waqf must have at least one cause allocation".to_string());
            }
            
            // Validate each allocation sums to 100%
            validate_hybrid_allocations(allocations)?;
            
            ic_cdk::println!(
                "INFO: Hybrid waqf validated - {} ({} cause allocations)",
                waqf.name, allocations.len()
            );
        }
    }
    
    // Non-hybrid waqf should not have hybrid allocations
    if !waqf.is_hybrid && waqf.hybrid_allocations.is_some() {
        return Err("Non-hybrid waqf cannot have hybrid allocations".to_string());
    }
    
    Ok(())
}

// Main assertion function for waqf operations
pub fn assert_waqf_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    ic_cdk::println!("🔍 ASSERT_WAQF_OPERATIONS CALLED - Collection: {}, Has current: {}", 
        context.data.collection, 
        context.data.data.current.is_some()
    );
    
    // Decode waqf data with proper error handling
    let waqf: WaqfData = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid waqf data structure: {}", e))?;
    
    // Validate the waqf data structure
    waqf_utils::validate_waqf_data(&waqf)?;
    
    // Validate waqf type and temporary waqf details
    validate_waqf_type_and_details(&waqf)?;
    
    // Check if this is a creation or update
    if context.data.data.current.is_none() {
        ic_cdk::println!("✨ NEW WAQF CREATION - validating minimum capital");
        // This is a new waqf creation - enforce minimum capital
        validate_minimum_waqf_asset(&waqf)?;
    } else {
        ic_cdk::println!("📝 WAQF UPDATE - validating field restrictions");
        // This is an update - validate field restrictions
        if let Some(current_doc) = &context.data.data.current {
            let previous_waqf: WaqfData = decode_doc_data(&current_doc.data)
                .map_err(|e| format!("Cannot decode previous waqf data: {}", e))?;
            
            ic_cdk::println!(
                "🔒 Checking immutability: previous waqf_asset={}, new waqf_asset={}",
                previous_waqf.waqf_asset, waqf.waqf_asset
            );
            
            // Validate that immutable fields haven't changed
            validate_creator_field_restrictions(&previous_waqf, &waqf, &context.caller.to_string())?;
        }
    }
    
    // Log the validation attempt
    ic_cdk::println!(
        "Waqf validation passed: {} - Status: {}, Initial Capital: {}", 
        waqf.name, waqf.status, waqf.waqf_asset
    );
    
    Ok(())
}

// Deletion assertion for waqfs
pub fn assert_waqf_deletion(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Get the waqf being deleted  
    let current_doc = context.data.data.current.as_ref()
        .ok_or("No current document found for deletion")?;
    let waqf_to_delete: WaqfData = decode_doc_data(&current_doc.data)
        .map_err(|e| format!("Cannot decode waqf data for deletion: {}", e))?;
    
    // Prevent deletion of active waqfs
    if waqf_to_delete.status == "active" {
        return Err("Cannot delete active waqf - change status first".into());
    }
    
    // Log deletion attempt
    ic_cdk::println!(
        "Waqf deletion: {} - Status: {}, Initial Capital: {}", 
        waqf_to_delete.name, waqf_to_delete.status, waqf_to_delete.waqf_asset
    );
    
    Ok(())
}

// Handle waqf changes (logging, notifications, etc.)
pub fn handle_waqf_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let waqf_data: WaqfData = decode_doc_data(&context.data.data.after.data)
        .map_err(|e| format!("Cannot decode waqf data: {}", e))?;
    
    // Determine if this is a creation or update
    let operation_type = if context.data.data.before.is_none() {
        "CREATE"
    } else {
        "UPDATE"
    };
    
    // Validate creator permissions for updates
    if operation_type == "UPDATE" {
        if let Some(before_doc) = &context.data.data.before {
            let previous_waqf: WaqfData = decode_doc_data(&before_doc.data)
                .map_err(|e| format!("Cannot decode previous waqf data: {}", e))?;
            
            validate_creator_field_restrictions(&previous_waqf, &waqf_data, &context.caller.to_string())?;
        }
    }
    
    // Enhanced logging for audit purposes
    ic_cdk::println!(
        "Waqf {}: {} - Name: {}, Status: {}, Donor: {}, Initial Capital: {}", 
        operation_type,
        context.data.key,
        waqf_data.name,
        waqf_data.status,
        waqf_data.donor.name,
        waqf_data.waqf_asset
    );
    
    // Log status-specific information
    match waqf_data.status.as_str() {
        "active" => {
            ic_cdk::println!(
                "IMPORTANT: Waqf activated - {} for {} (Initial Capital: {})", 
                waqf_data.name, waqf_data.donor.name, waqf_data.waqf_asset
            );
        },
        "completed" => {
            ic_cdk::println!(
                "INFO: Waqf completed - {} for {}", 
                waqf_data.name, waqf_data.donor.name
            );
        },
        "archived" => {
            ic_cdk::println!(
                "NOTICE: Waqf archived - {} for {}", 
                waqf_data.name, waqf_data.donor.name
            );
        },
        _ => {}
    }
    
    Ok(())
}
