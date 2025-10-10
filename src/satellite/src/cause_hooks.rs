use serde::{Deserialize, Serialize};
use junobuild_satellite::{AssertSetDocContext, AssertDeleteDocContext, OnSetDocContext};
use junobuild_utils::decode_doc_data;

// Note: Frontend uses simple string values for status: "pending" | "approved" | "rejected"
// No enums needed - validation is done via string matching

// Cause structure matching frontend interface
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Cause {
    pub id: String,
    pub name: String,                    // Frontend uses "name" not "title"
    pub description: String,
    pub icon: String,                    // Frontend has icon field
    #[serde(rename = "coverImage")]
    pub cover_image: Option<String>,     // Frontend optional coverImage
    pub category: String,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    pub status: String,                  // Frontend uses string: "pending" | "approved" | "rejected"
    #[serde(rename = "sortOrder")]
    pub sort_order: i32,                 // Frontend has sortOrder
    pub followers: i32,                  // Frontend tracks followers
    #[serde(rename = "fundsRaised")]
    pub funds_raised: f64,               // Frontend tracks fundsRaised
    #[serde(rename = "impactScore")]
    pub impact_score: Option<f64>,       // Frontend optional impactScore (0-100)
    #[serde(rename = "createdAt")]
    pub created_at: String,              // Frontend uses ISO string timestamps
    #[serde(rename = "updatedAt")]
    pub updated_at: String,              // Frontend uses ISO string timestamps
}

// Cause validation function
fn validate_cause_data(cause: &Cause) -> std::result::Result<(), String> {
    // 1. Basic required fields validation
    if cause.id.trim().is_empty() {
        return Err("Cause ID is required".into());
    }
    
    if cause.name.trim().is_empty() {
        return Err("Cause name is required".into());
    }
    
    if cause.name.len() > 200 {
        return Err("Cause name must be 200 characters or less".into());
    }
    
    if cause.description.trim().is_empty() {
        return Err("Cause description is required".into());
    }
    
    if cause.description.len() > 5000 {
        return Err("Cause description must be 5000 characters or less".into());
    }
    
    if cause.category.trim().is_empty() {
        return Err("Cause category is required".into());
    }
    
    // 2. Icon field validation
    if cause.icon.trim().is_empty() {
        return Err("Cause icon is required".into());
    }
    
    // 3. Financial validation
    if cause.funds_raised < 0.0 {
        return Err("Funds raised cannot be negative".into());
    }
    
    if let Some(score) = cause.impact_score {
        if score < 0.0 || score > 100.0 {
            return Err("Impact score must be between 0 and 100".into());
        }
    }
    
    // 4. Status validation
    validate_cause_status(&cause.status)?;
    
    // 5. Cover image URL validation
    if let Some(ref url) = cause.cover_image {
        if !url.is_empty() && !is_valid_image_url(url) {
            return Err("Invalid cover image URL format".into());
        }
    }
    
    // 6. Timestamp validation
    if cause.created_at.trim().is_empty() {
        return Err("Created at timestamp is required".into());
    }
    
    if cause.updated_at.trim().is_empty() {
        return Err("Updated at timestamp is required".into());
    }
    
    Ok(())
}

// Validate cause status values
fn validate_cause_status(status: &str) -> std::result::Result<(), String> {
    let valid_statuses = ["pending", "approved", "rejected"];
    
    if !valid_statuses.contains(&status) {
        return Err(format!(
            "Invalid cause status '{}'. Valid statuses: {}",
            status,
            valid_statuses.join(", ")
        ));
    }
    
    Ok(())
}

// Validate cause business rules based on status
fn validate_cause_status_rules(cause: &Cause) -> std::result::Result<(), String> {
    match cause.status.as_str() {
        "pending" => {
            // Pending causes should not be active
            if cause.is_active {
                return Err("Pending causes cannot be active".into());
            }
        },
        "approved" => {
            // Approved causes can be active
            // This is the normal state for visible causes
        },
        "rejected" => {
            // Rejected causes should not be active
            if cause.is_active {
                return Err("Rejected causes cannot be active".into());
            }
        },
        _ => {
            return Err(format!("Unknown cause status: {}", cause.status));
        }
    }
    
    Ok(())
}

// Basic image URL validation
fn is_valid_image_url(url: &str) -> bool {
    if url.len() > 2048 {
        return false;
    }
    
    // Must be HTTP/HTTPS
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return false;
    }
    
    // Should have image extension or be from known image services
    let lower_url = url.to_lowercase();
    let image_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    let image_services = ["imgur.com", "cloudinary.com", "amazonaws.com", "googleusercontent.com"];
    
    image_extensions.iter().any(|ext| lower_url.ends_with(ext)) ||
    image_services.iter().any(|service| lower_url.contains(service))
}

// Business rules validation for causes
fn validate_cause_business_rules(cause: &Cause, context: &AssertSetDocContext) -> std::result::Result<(), String> {
    // 1. Permission validation
    validate_cause_permissions(cause, context)?;
    
    // 2. Rate limiting validation
    validate_cause_rate_limits(context)?;
    
    // 3. Category validation
    validate_cause_category(&cause.category)?;
    
    Ok(())
}

// Validate cause permissions based on status
fn validate_cause_permissions(cause: &Cause, _context: &AssertSetDocContext) -> std::result::Result<(), String> {
    // For now, we'll allow all operations during testing
    // In production, you would check caller permissions based on status changes
    
    match cause.status.as_str() {
        "approved" => {
            // Only users with cause_approval permission should be able to approve
            // let caller_permissions = get_caller_permissions(&context.caller).await?;
            // if !caller_permissions.contains(&"cause_approval".to_string()) {
            //     return Err("Only authorized users can approve causes".into());
            // }
        },
        "rejected" => {
            // Only users with cause_approval permission should be able to reject
            // Similar check as above
        },
        _ => {
            // Other status changes might have different permission requirements
        }
    }
    
    Ok(())
}

// Validate cause creation rate limits
fn validate_cause_rate_limits(_context: &AssertSetDocContext) -> std::result::Result<(), String> {
    // For testing, we'll skip rate limiting
    // In production, you would check:
    // - How many causes the user has created recently
    // - Overall system limits
    // - IP-based limits
    
    // let recent_causes = count_recent_causes_by_user(&context.caller, 3600).await?;
    // if recent_causes >= 5 {
    //     return Err("Too many causes created recently. Please wait before creating more.".into());
    // }
    
    Ok(())
}

// Validate cause category
fn validate_cause_category(category: &str) -> std::result::Result<(), String> {
    let valid_categories = [
        "education",
        "healthcare", 
        "poverty_alleviation",
        "disaster_relief",
        "environmental",
        "community_development",
        "orphan_care",
        "elder_care",
        "humanitarian_aid",
        "religious_services",
        "other"
    ];
    
    if !valid_categories.contains(&category.to_lowercase().as_str()) {
        return Err(format!(
            "Invalid category '{}'. Valid categories: {}", 
            category,
            valid_categories.join(", ")
        ));
    }
    
    Ok(())
}

// Main assertion function for cause operations
pub fn assert_cause_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Decode cause data with proper error handling
    let cause: Cause = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid cause data structure: {}", e))?;
    
    // Validate the cause data structure
    validate_cause_data(&cause)?;
    
    // Validate cause status business rules
    validate_cause_status_rules(&cause)?;
    
    // Business logic validation
    validate_cause_business_rules(&cause, &context)?;
    
    // Log the validation attempt
    ic_cdk::println!("Cause validation passed: {} - Status: {}, Active: {}", 
                    cause.name, cause.status, cause.is_active);
    
    Ok(())
}

// Deletion assertion for causes
pub fn assert_cause_deletion(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Get the cause being deleted
    let current_doc = context.data.data.current.as_ref()
        .ok_or("No current document found for deletion")?;
    let cause_to_delete: Cause = decode_doc_data(&current_doc.data)
        .map_err(|e| format!("Cannot decode cause data for deletion: {}", e))?;
    
    // Prevent deletion of active causes with donations
    if cause_to_delete.is_active {
        return Err("Cannot delete active causes. Pause or complete the cause first.".into());
    }
    
    if cause_to_delete.funds_raised > 0.0 {
        return Err("Cannot delete causes that have received donations.".into());
    }
    
    // Log critical deletion attempt
    ic_cdk::println!("Cause deletion attempt: {} - Status: {}, Raised: {}", 
                    cause_to_delete.name, cause_to_delete.status, cause_to_delete.funds_raised);
    
    Ok(())
}

// Handle cause changes (logging, notifications, etc.)
pub fn handle_cause_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let cause_data: Cause = decode_doc_data(&context.data.data.after.data)?;
    
    // Determine if this is a creation or update
    let operation_type = if context.data.data.before.is_none() {
        "CREATE"
    } else {
        "UPDATE"
    };
    
    // Enhanced logging for audit purposes
    ic_cdk::println!(
        "Cause {}: {} - Name: '{}', Status: {}, Active: {}, Raised: ${}", 
        operation_type,
        context.data.key,
        cause_data.name,
        cause_data.status,
        cause_data.is_active,
        cause_data.funds_raised
    );
    
    // Log status-specific information
    match cause_data.status.as_str() {
        "approved" => {
            ic_cdk::println!("IMPORTANT: Cause approved - '{}' (Followers: {}, Raised: ${})", 
                           cause_data.name, cause_data.followers, cause_data.funds_raised);
        },
        "rejected" => {
            ic_cdk::println!("NOTICE: Cause rejected - '{}'", 
                           cause_data.name);
        },
        _ => {}
    }
    
    // Additional processing for production:
    // - Send notifications to stakeholders
    // - Update related waqfs or donations
    // - Trigger compliance workflows
    // - Send status update emails
    
    Ok(())
}