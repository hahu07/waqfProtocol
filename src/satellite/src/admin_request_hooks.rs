use serde::{Deserialize, Serialize};
use junobuild_satellite::{AssertSetDocContext, AssertDeleteDocContext, OnSetDocContext};
use junobuild_utils::decode_doc_data;

// Admin request type enum - should match frontend
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
pub enum AdminRequestType {
    #[serde(rename = "add")]
    Add,
    #[serde(rename = "remove")]
    Remove,
    #[serde(rename = "update")]
    Update,
}

// Admin request status enum - should match frontend
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
pub enum AdminRequestStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "approved")]
    Approved,
    #[serde(rename = "rejected")]
    Rejected,
    #[serde(rename = "expired")]
    Expired,
}

// Admin roles enum - reused from admin_hooks
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

// Admin request structure for validation
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AdminRequest {
    pub id: String,
    #[serde(rename = "type")]
    pub request_type: AdminRequestType,
    pub status: AdminRequestStatus,
    #[serde(rename = "targetAdminEmail")]
    pub target_admin_email: String,
    #[serde(rename = "targetRole")]
    pub target_role: AdminRole,
    pub justification: String,
    #[serde(rename = "requestedBy")]
    pub requested_by: String,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "reviewedBy")]
    pub reviewed_by: Option<String>,
    #[serde(rename = "reviewedAt")]
    pub reviewed_at: Option<u64>,
    #[serde(rename = "reviewNotes")]
    pub review_notes: Option<String>,
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<u64>,
}

// Admin request validation function
fn validate_admin_request_data(request: &AdminRequest) -> std::result::Result<(), String> {
    // 1. Basic required fields validation
    if request.id.trim().is_empty() {
        return Err("Request ID is required".into());
    }
    
    if request.target_admin_email.trim().is_empty() {
        return Err("Target admin email is required".into());
    }
    
    if !is_valid_email(&request.target_admin_email) {
        return Err("Invalid target admin email format".into());
    }
    
    if request.justification.trim().is_empty() {
        return Err("Justification is required".into());
    }
    
    if request.justification.len() < 10 {
        return Err("Justification must be at least 10 characters".into());
    }
    
    if request.justification.len() > 2000 {
        return Err("Justification must be 2000 characters or less".into());
    }
    
    if request.requested_by.trim().is_empty() {
        return Err("Requested by field is required".into());
    }
    
    if request.created_at == 0 {
        return Err("Created at timestamp is required".into());
    }
    
    // 2. Status-specific validation
    validate_request_status_consistency(request)?;
    
    // 3. Role-specific validation
    validate_request_role_rules(request)?;
    
    Ok(())
}

// Email validation (basic implementation)
fn is_valid_email(email: &str) -> bool {
    email.contains('@') && email.len() >= 5 && email.len() <= 254
}

// Validate request status consistency
fn validate_request_status_consistency(request: &AdminRequest) -> std::result::Result<(), String> {
    match request.status {
        AdminRequestStatus::Pending => {
            // Pending requests should not have review data
            if request.reviewed_by.is_some() || request.reviewed_at.is_some() {
                return Err("Pending requests cannot have review data".into());
            }
        },
        AdminRequestStatus::Approved | AdminRequestStatus::Rejected => {
            // Approved/rejected requests must have review data
            if request.reviewed_by.is_none() || request.reviewed_at.is_none() {
                return Err("Approved/rejected requests must have reviewer and review date".into());
            }
            
            // Review timestamp should be after creation
            if let Some(reviewed_at) = request.reviewed_at {
                if reviewed_at < request.created_at {
                    return Err("Review date cannot be before creation date".into());
                }
            }
        },
        AdminRequestStatus::Expired => {
            // Expired requests should have expiry date in the past
            if let Some(expires_at) = request.expires_at {
                let current_time = ic_cdk::api::time() / 1_000_000; // Convert to milliseconds
                if expires_at > current_time {
                    return Err("Expired requests must have expiry date in the past".into());
                }
            }
        },
    }
    
    Ok(())
}

// Validate role-specific business rules
fn validate_request_role_rules(request: &AdminRequest) -> std::result::Result<(), String> {
    match request.request_type {
        AdminRequestType::Add => {
            // Adding Platform Admin requires stricter justification
            if request.target_role == AdminRole::PlatformAdmin {
                if request.justification.len() < 50 {
                    return Err("Platform Admin additions require detailed justification (minimum 50 characters)".into());
                }
            }
        },
        AdminRequestType::Remove => {
            // Removing admins requires careful consideration
            if request.target_role == AdminRole::PlatformAdmin {
                if request.justification.len() < 100 {
                    return Err("Platform Admin removals require extensive justification (minimum 100 characters)".into());
                }
            }
        },
        AdminRequestType::Update => {
            // Role updates need proper justification
            if request.justification.len() < 20 {
                return Err("Role updates require adequate justification (minimum 20 characters)".into());
            }
        },
    }
    
    Ok(())
}

// Business rules validation for admin requests
fn validate_admin_request_business_rules(request: &AdminRequest, context: &AssertSetDocContext) -> std::result::Result<(), String> {
    // 1. Permission validation
    validate_request_permissions(request, context)?;
    
    // 2. Rate limiting validation
    validate_request_rate_limits(context)?;
    
    // 3. Duplicate validation
    validate_duplicate_requests(request)?;
    
    // 4. Request expiry validation
    validate_request_expiry(request)?;
    
    Ok(())
}

// Validate requester permissions
fn validate_request_permissions(_request: &AdminRequest, _context: &AssertSetDocContext) -> std::result::Result<(), String> {
    // For testing, we'll allow all operations
    // In production, you would check:
    // - Only Compliance Officers can create admin requests
    // - Only Platform Admins can approve/reject requests
    
    // let caller_permissions = get_caller_permissions(&context.caller).await?;
    // 
    // match request.status {
    //     AdminRequestStatus::Pending => {
    //         // Creating new requests - check admin_request_creation permission
    //         if !caller_permissions.contains(&"admin_request_creation".to_string()) {
    //             return Err("Only Compliance Officers can create admin requests".into());
    //         }
    //     },
    //     AdminRequestStatus::Approved | AdminRequestStatus::Rejected => {
    //         // Reviewing requests - check admin_request_approval permission
    //         if !caller_permissions.contains(&"admin_request_approval".to_string()) {
    //             return Err("Only Platform Admins can approve/reject admin requests".into());
    //         }
    //     },
    //     _ => {}
    // }
    
    Ok(())
}

// Validate rate limits for request creation
fn validate_request_rate_limits(_context: &AssertSetDocContext) -> std::result::Result<(), String> {
    // For testing, we'll skip rate limiting
    // In production, you would check:
    // - Maximum requests per user per day/hour
    // - System-wide request limits
    
    // let recent_requests = count_recent_requests_by_user(&context.caller, 86400).await?;
    // if recent_requests >= 10 {
    //     return Err("Too many admin requests created recently. Please wait before creating more.".into());
    // }
    
    Ok(())
}

// Validate against duplicate requests
fn validate_duplicate_requests(_request: &AdminRequest) -> std::result::Result<(), String> {
    // For testing, we'll skip duplicate checking
    // In production, you would check for existing pending requests:
    // - Same target email + same request type
    // - Same target email + same role
    
    // let existing_requests = get_pending_requests_for_email(&request.target_admin_email).await?;
    // if !existing_requests.is_empty() {
    //     return Err(format!(
    //         "Pending admin request already exists for email: {}", 
    //         request.target_admin_email
    //     ));
    // }
    
    Ok(())
}

// Validate request expiry
fn validate_request_expiry(request: &AdminRequest) -> std::result::Result<(), String> {
    if let Some(expires_at) = request.expires_at {
        // Expiry should be in the future for new/pending requests
        if request.status == AdminRequestStatus::Pending {
            let current_time = ic_cdk::api::time() / 1_000_000; // Convert to milliseconds
            if expires_at <= current_time {
                return Err("Request expiry date must be in the future".into());
            }
            
            // Expiry should not be too far in the future (max 30 days)
            let max_expiry = current_time + (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
            if expires_at > max_expiry {
                return Err("Request expiry date cannot exceed 30 days from now".into());
            }
        }
        
        // Creation date should be before expiry
        if expires_at <= request.created_at {
            return Err("Request expiry date must be after creation date".into());
        }
    }
    
    Ok(())
}

// Main assertion function for admin request operations
pub fn assert_admin_request_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Decode admin request data with proper error handling
    let request: AdminRequest = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid admin request data structure: {}", e))?;
    
    // Validate the admin request data structure
    validate_admin_request_data(&request)?;
    
    // Business logic validation
    validate_admin_request_business_rules(&request, &context)?;
    
    // Log the validation attempt
    ic_cdk::println!(
        "Admin request validation passed: {} - Type: {:?}, Status: {:?}, Target: {}", 
        request.id, request.request_type, request.status, request.target_admin_email
    );
    
    Ok(())
}

// Deletion assertion for admin requests
pub fn assert_admin_request_deletion(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Get the request being deleted
    let current_doc = context.data.data.current.as_ref()
        .ok_or("No current document found for deletion")?;
    let request_to_delete: AdminRequest = decode_doc_data(&current_doc.data)
        .map_err(|e| format!("Cannot decode admin request data for deletion: {}", e))?;
    
    // Prevent deletion of approved requests (for audit trail)
    if request_to_delete.status == AdminRequestStatus::Approved {
        return Err("Cannot delete approved admin requests (audit trail requirement)".into());
    }
    
    // Allow deletion of pending, rejected, or expired requests
    match request_to_delete.status {
        AdminRequestStatus::Pending => {
            // Only the requester should be able to delete their own pending requests
            // In production, you would verify the caller matches requested_by
        },
        AdminRequestStatus::Rejected | AdminRequestStatus::Expired => {
            // These can be cleaned up for housekeeping
        },
        _ => {}
    }
    
    // Log deletion attempt
    ic_cdk::println!(
        "Admin request deletion: {} - Type: {:?}, Status: {:?}, Target: {}", 
        request_to_delete.id, request_to_delete.request_type, 
        request_to_delete.status, request_to_delete.target_admin_email
    );
    
    Ok(())
}

// Handle admin request changes (logging, notifications, etc.)
pub fn handle_admin_request_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let request_data: AdminRequest = decode_doc_data(&context.data.data.after.data)?;
    
    // Determine if this is a creation or update
    let operation_type = if context.data.data.before.is_none() {
        "CREATE"
    } else {
        "UPDATE"
    };
    
    // Enhanced logging for audit purposes
    ic_cdk::println!(
        "Admin Request {}: {} - ID: {}, Type: {:?}, Status: {:?}, Target: {}, Role: {:?}", 
        operation_type,
        context.data.key,
        request_data.id,
        request_data.request_type,
        request_data.status,
        request_data.target_admin_email,
        request_data.target_role
    );
    
    // Log status-specific information
    match request_data.status {
        AdminRequestStatus::Approved => {
            ic_cdk::println!(
                "CRITICAL: Admin request APPROVED - {:?} {:?} for {} by {:?}", 
                request_data.request_type, request_data.target_role,
                request_data.target_admin_email, request_data.reviewed_by
            );
        },
        AdminRequestStatus::Rejected => {
            ic_cdk::println!(
                "IMPORTANT: Admin request REJECTED - {:?} {:?} for {} by {:?}, Reason: {:?}", 
                request_data.request_type, request_data.target_role,
                request_data.target_admin_email, request_data.reviewed_by,
                request_data.review_notes
            );
        },
        AdminRequestStatus::Pending => {
            ic_cdk::println!(
                "INFO: New admin request PENDING - {:?} {:?} for {} by {}", 
                request_data.request_type, request_data.target_role,
                request_data.target_admin_email, request_data.requested_by
            );
        },
        _ => {}
    }
    
    // Additional processing for production:
    // - Send notification emails to approvers when new requests are created
    // - Send notification to requesters when requests are approved/rejected
    // - Trigger automated admin addition/removal when approved
    // - Update audit trails and compliance records
    
    Ok(())
}