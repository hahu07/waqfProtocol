use serde::{Deserialize, Serialize};
use junobuild_satellite::{AssertSetDocContext, AssertDeleteDocContext, OnSetDocContext};
use junobuild_utils::decode_doc_data;

// Activity log structure for WaqfProtocol - simplified and focused
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ActivityLog {
    pub id: String,
    pub action: String,           // e.g., "admin_created", "cause_approved", "waqf_donated"
    pub category: String,         // "admin", "cause", "waqf", "donation"
    pub level: String,           // "info", "warning", "error", "critical"
    
    // User context
    #[serde(rename = "userId")]
    pub user_id: Option<String>,
    #[serde(rename = "userEmail")]
    pub user_email: Option<String>,
    
    // Activity details
    pub details: Option<String>,
    
    // Resource context (cause ID, waqf ID, etc.)
    #[serde(rename = "resourceId")]
    pub resource_id: Option<String>,
    #[serde(rename = "resourceType")]
    pub resource_type: Option<String>,
    
    // Timestamp
    pub timestamp: u64,
}

// Activity log validation function - simplified for WaqfProtocol
fn validate_activity_log_data(log: &ActivityLog) -> std::result::Result<(), String> {
    // 1. Required fields
    if log.id.trim().is_empty() {
        return Err("Activity log ID is required".into());
    }
    
    if log.action.trim().is_empty() {
        return Err("Activity log action is required".into());
    }
    
    if log.category.trim().is_empty() {
        return Err("Activity log category is required".into());
    }
    
    if log.level.trim().is_empty() {
        return Err("Activity log level is required".into());
    }
    
    if log.timestamp == 0 {
        return Err("Activity log timestamp is required".into());
    }
    
    // 2. Validate category values
    if !["admin", "cause", "waqf", "donation", "user", "system", "audit"].contains(&log.category.as_str()) {
        return Err("Invalid activity log category".into());
    }
    
    // 3. Validate level values
    if !["info", "warning", "error", "critical"].contains(&log.level.as_str()) {
        return Err("Invalid activity log level".into());
    }
    
    // 4. Validate length limits
    if log.action.len() > 100 {
        return Err("Activity action must be 100 characters or less".into());
    }
    
    if let Some(ref details) = log.details {
        if details.len() > 1000 {
            return Err("Activity details must be 1000 characters or less".into());
        }
    }
    
    // 5. Basic email validation if provided
    if let Some(ref email) = log.user_email {
        if !email.is_empty() && !email.contains('@') {
            return Err("Invalid user email format".into());
        }
    }
    
    Ok(())
}

// Main assertion function for activity log operations - simplified for WaqfProtocol
pub fn assert_activity_log_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Decode activity log data
    let log: ActivityLog = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid activity log data structure: {}", e))?;
    
    // Validate the activity log data
    validate_activity_log_data(&log)?;
    
    // Log validation success for critical/error activities only
    if log.level == "critical" || log.level == "error" {
        ic_cdk::println!(
            "Activity log validation passed: {} - Action: '{}', Category: {}, Level: {}", 
            log.id, log.action, log.category, log.level
        );
    }
    
    Ok(())
}

// Deletion assertion for activity logs - simplified for WaqfProtocol
pub fn assert_activity_log_deletion(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Get the log being deleted
    let current_doc = context.data.data.current.as_ref()
        .ok_or("No current document found for deletion")?;
    let log_to_delete: ActivityLog = decode_doc_data(&current_doc.data)
        .map_err(|e| format!("Cannot decode activity log data for deletion: {}", e))?;
    
    // Prevent deletion of critical audit logs
    if log_to_delete.category == "audit" || (log_to_delete.level == "critical") {
        return Err("Cannot delete critical audit logs (compliance requirement)".into());
    }
    
    // Basic age check - don't delete recent logs
    let current_time = ic_cdk::api::time() / 1_000_000;
    let log_age = current_time - log_to_delete.timestamp;
    let min_retention = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if log_age < min_retention {
        return Err("Activity logs cannot be deleted within 7 days of creation".into());
    }
    
    Ok(())
}

// Handle activity log changes - minimal processing for WaqfProtocol
pub fn handle_activity_log_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let log_data: ActivityLog = decode_doc_data(&context.data.data.after.data)?;
    
    // Only log critical events to avoid recursion and spam
    if log_data.level == "critical" {
        ic_cdk::println!(
            "CRITICAL activity logged: {} - {}", 
            log_data.action, log_data.details.unwrap_or("No details provided".to_string())
        );
    }
    
    Ok(())
}
