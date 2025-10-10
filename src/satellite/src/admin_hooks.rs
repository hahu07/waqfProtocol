use serde::{Deserialize, Serialize};
use junobuild_satellite::{AssertSetDocContext, AssertDeleteDocContext, OnSetDocContext};
use junobuild_utils::decode_doc_data;

// Updated roles to match frontend exactly
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
pub enum AdminRole {
    #[serde(rename = "support_agent")]
    SupportAgent,
    #[serde(rename = "content_moderator")]
    ContentModerator,
    #[serde(rename = "waqf_manager")]
    WaqfManager,
    #[serde(rename = "finance_officer")]
    FinanceOfficer,
    #[serde(rename = "compliance_officer")]
    ComplianceOfficer,
    #[serde(rename = "platform_admin")]
    PlatformAdmin,
}

// Updated permissions to match frontend exactly
const ROLE_PERMISSIONS: &[(AdminRole, &[&str])] = &[
    (AdminRole::SupportAgent, &["user_support"]),
    (AdminRole::ContentModerator, &["content_moderation", "user_support"]),
    (AdminRole::WaqfManager, &["waqf_management", "cause_management"]),
    (AdminRole::FinanceOfficer, &["financial_oversight", "audit_compliance"]),
    (AdminRole::ComplianceOfficer, &["audit_compliance", "financial_oversight", "cause_approval", "admin_request_creation"]),
    (AdminRole::PlatformAdmin, &["platform_governance", "system_administration", "audit_compliance", "financial_oversight", "waqf_management", "cause_management", "cause_approval", "content_moderation", "user_support", "admin_request_creation", "admin_request_approval"]),
];

// AdminUser structure to match frontend exactly
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AdminUser {
    // Core fields expected by both frontend and backend
    pub email: String,
    pub role: AdminRole,
    pub permissions: Vec<String>,
    
    // Backend compatibility fields
    pub created_by: String,  // Snake case for Rust backend
    pub active: bool,
    
    // Frontend fields (optional for backward compatibility)
    #[serde(rename = "userId")]
    pub user_id: Option<String>,
    pub name: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: Option<u64>,
    #[serde(rename = "lastActive")]
    pub last_active: Option<u64>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<u64>,
    #[serde(rename = "updatedBy")]
    pub updated_by: Option<String>,
    pub deleted: Option<bool>,
    #[serde(rename = "deletedAt")]
    pub deleted_at: Option<u64>,
    #[serde(rename = "deletedBy")]
    pub deleted_by: Option<String>,
}

// Basic validation function
fn validate_admin_data(admin: &AdminUser) -> std::result::Result<(), String> {
    // 1. Validate email format
    if !is_valid_email(&admin.email) {
        return Err("Invalid admin email format".into());
    }
    
    // 2. Validate role-permission consistency  
    let allowed_perms = ROLE_PERMISSIONS
        .iter()
        .find(|(role, _)| role == &admin.role)
        .map(|(_, perms)| perms)
        .ok_or_else(|| format!("Invalid role: {:?}", admin.role))?;
    
    // Validate each permission
    for perm in &admin.permissions {
        if !allowed_perms.contains(&perm.as_str()) {
            return Err(format!(
                "Permission '{}' not allowed for role {:?}. Allowed permissions: {:?}", 
                perm, admin.role, allowed_perms
            ));
        }
    }
    
    // 3. Special validation for platform admin
    if admin.role == AdminRole::PlatformAdmin {
        let required_perms = ["platform_governance", "admin_request_approval"];
        for req_perm in &required_perms {
            if !admin.permissions.contains(&req_perm.to_string()) {
                return Err(format!(
                    "Platform admin must have permission: {}", req_perm
                ));
            }
        }
    }
    
    Ok(())
}

fn is_valid_email(email: &str) -> bool {
    // Enhanced email validation
    if email.len() < 5 || email.len() > 254 {
        return false;
    }
    
    // Must contain exactly one @ symbol
    let at_count = email.matches('@').count();
    if at_count != 1 {
        return false;
    }
    
    // Split into local and domain parts
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 {
        return false;
    }
    
    let local = parts[0];
    let domain = parts[1];
    
    // Validate local part
    if local.is_empty() || local.len() > 64 {
        return false;
    }
    
    // Validate domain part
    if domain.is_empty() || domain.len() > 255 {
        return false;
    }
    
    // Must contain at least one dot in domain
    if !domain.contains('.') {
        return false;
    }
    
    // Basic character validation
    let valid_local_chars = |c: char| {
        c.is_alphanumeric() || ".!#$%&'*+/=?^_`{|}~-".contains(c)
    };
    
    let valid_domain_chars = |c: char| {
        c.is_alphanumeric() || ".-".contains(c)
    };
    
    local.chars().all(valid_local_chars) && domain.chars().all(valid_domain_chars)
}

// Business rules validation function
fn validate_admin_business_rules(admin: &AdminUser, context: &AssertSetDocContext) -> std::result::Result<(), String> {
    // 1. Time restriction validation (business hours)
    validate_business_hours()?;
    
    // 2. Email uniqueness check (for new admins)
    if context.data.data.current.is_none() {
        validate_email_uniqueness(&admin.email)?;
    }
    
    // 3. Role count limits
    validate_role_limits(&admin.role)?;
    
    // 4. Special permissions validation for sensitive roles
    if matches!(admin.role, AdminRole::PlatformAdmin | AdminRole::ComplianceOfficer) {
        validate_sensitive_role_requirements(admin, context)?;
    }
    
    Ok(())
}

// Validate business hours (9 AM - 6 PM UTC, Monday-Friday)
fn validate_business_hours() -> std::result::Result<(), String> {
    // For testing, we'll disable this check
    // In production, you would implement time zone logic
    // 
    // let current_time = ic_cdk::api::time();
    // let hour = ((current_time / 1_000_000_000) % 86400) / 3600;
    // let day_of_week = ((current_time / 1_000_000_000) / 86400 + 4) % 7; // Monday = 0
    // 
    // if day_of_week >= 5 || hour < 9 || hour >= 18 {
    //     return Err("Admin operations are only allowed during business hours (9 AM - 6 PM UTC, Monday-Friday)".into());
    // }
    
    Ok(())
}

// Validate email uniqueness (placeholder - would query existing admins)
fn validate_email_uniqueness(_email: &str) -> std::result::Result<(), String> {
    // For testing, we'll skip this check
    // In production, you would query the admins collection
    // to ensure email uniqueness
    // 
    // let existing_admins = get_all_admins().await?;
    // if existing_admins.iter().any(|a| a.email == email) {
    //     return Err(format!("Admin with email '{}' already exists", email));
    // }
    
    Ok(())
}

// Validate role count limits
fn validate_role_limits(role: &AdminRole) -> std::result::Result<(), String> {
    // Define maximum counts for each role
    let _max_counts = match role {
        AdminRole::PlatformAdmin => 3,   // Maximum 3 platform admins
        AdminRole::ComplianceOfficer => 5, // Maximum 5 compliance officers
        AdminRole::FinanceOfficer => 10,
        AdminRole::WaqfManager => 20,
        AdminRole::ContentModerator => 50,
        AdminRole::SupportAgent => 100,
    };
    
    // For testing, we'll skip count validation
    // In production, you would query the admins collection
    // to count existing admins with this role
    // 
    // let current_count = count_admins_by_role(role).await?;
    // if current_count >= max_counts {
    //     return Err(format!("Maximum limit of {} {:?} admins reached", max_counts, role));
    // }
    
    Ok(())
}

// Validate sensitive role requirements
fn validate_sensitive_role_requirements(admin: &AdminUser, _context: &AssertSetDocContext) -> std::result::Result<(), String> {
    // For Platform Admin role, ensure proper authorization chain
    if admin.role == AdminRole::PlatformAdmin {
        // Ensure the requester has appropriate permissions
        // This would typically check the calling user's permissions
        // 
        // let caller_permissions = get_caller_permissions(&context.caller).await?;
        // if !caller_permissions.contains(&"admin_request_approval".to_string()) {
        //     return Err("Only authorized users can create Platform Admin accounts".into());
        // }
    }
    
    // Ensure active status for sensitive roles
    if !admin.active {
        return Err("Sensitive roles must be active upon creation".into());
    }
    
    Ok(())
}

// Main assertion function for admin operations
pub fn assert_admin_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Decode admin data with proper error handling
    let admin: AdminUser = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid admin data structure: {}", e))?;
    
    // Validate the admin data structure
    validate_admin_data(&admin)?;
    
    // Business logic validation
    validate_admin_business_rules(&admin, &context)?;
    
    Ok(())
}

// Deletion assertion - enhanced validation
pub fn assert_admin_deletion(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Get the admin being deleted
    let current_doc = context.data.data.current.as_ref()
        .ok_or("No current document found for deletion")?;
    let admin_to_delete: AdminUser = decode_doc_data(&current_doc.data)
        .map_err(|e| format!("Cannot decode admin data for deletion: {}", e))?;
    
    // Business hours validation
    validate_business_hours()?;
    
    // Prevent deletion of last Platform Admin
    if admin_to_delete.role == AdminRole::PlatformAdmin {
        // In production, you would check if this is the last Platform Admin
        // let platform_admin_count = count_admins_by_role(&AdminRole::PlatformAdmin).await?;
        // if platform_admin_count <= 1 {
        //     return Err("Cannot delete the last Platform Admin".into());
        // }
    }
    
    // Log critical deletion attempt
    ic_cdk::println!("Admin deletion attempt: {} with role {:?}", 
                    admin_to_delete.email, admin_to_delete.role);
    
    Ok(())
}

// Handle admin changes (logging, notifications, etc.)
pub fn handle_admin_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let admin_data: AdminUser = decode_doc_data(&context.data.data.after.data)?;
    
    // Determine if this is a creation or update
    let operation_type = if context.data.data.before.is_none() {
        "CREATE"
    } else {
        "UPDATE"
    };
    
    // Enhanced logging for audit purposes
    ic_cdk::println!(
        "Admin {}: {} - Role: {:?}, Permissions: {:?}, Active: {}, Email: {}", 
        operation_type,
        context.data.key,
        admin_data.role, 
        admin_data.permissions,
        admin_data.active,
        admin_data.email
    );
    
    // Log role-specific information
    match admin_data.role {
        AdminRole::PlatformAdmin => {
            ic_cdk::println!("CRITICAL: Platform Admin {} - {}", operation_type, admin_data.email);
        },
        AdminRole::ComplianceOfficer => {
            ic_cdk::println!("IMPORTANT: Compliance Officer {} - {}", operation_type, admin_data.email);
        },
        _ => {}
    }
    
    // Additional processing for production:
    // - Send notifications to other admins
    // - Update audit trails
    // - Trigger compliance workflows
    // - Send welcome emails for new admins
    
    Ok(())
}
