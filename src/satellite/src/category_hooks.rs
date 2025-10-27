use serde::{Deserialize, Serialize};
use junobuild_satellite::{AssertSetDocContext, AssertDeleteDocContext, OnSetDocContext};
use junobuild_utils::decode_doc_data;

/// Category structure matching frontend interface
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub color: Option<String>,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    #[serde(rename = "sortOrder")]
    pub sort_order: i32,
    #[serde(rename = "associatedWaqfTypes")]
    pub associated_waqf_types: Vec<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// Subcategory structure matching frontend interface
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Subcategory {
    pub id: String,
    #[serde(rename = "categoryId")]
    pub category_id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub examples: Vec<String>,
    #[serde(rename = "isActive")]
    pub is_active: bool,
    #[serde(rename = "sortOrder")]
    pub sort_order: i32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// Validate category data structure
fn validate_category_data(category: &Category) -> std::result::Result<(), String> {
    // 1. ID validation
    if category.id.trim().is_empty() {
        return Err("Category ID is required".into());
    }

    if category.id.len() > 100 {
        return Err("Category ID must be 100 characters or less".into());
    }

    // 2. Name validation
    if category.name.trim().is_empty() {
        return Err("Category name is required".into());
    }

    if category.name.len() > 200 {
        return Err("Category name must be 200 characters or less".into());
    }

    // 3. Description validation
    if category.description.trim().is_empty() {
        return Err("Category description is required".into());
    }

    if category.description.len() > 1000 {
        return Err("Category description must be 1000 characters or less".into());
    }

    // 4. Icon validation
    if category.icon.trim().is_empty() {
        return Err("Category icon is required".into());
    }

    // 5. Color validation (if provided)
    if let Some(ref color) = category.color {
        if !color.is_empty() && !is_valid_hex_color(color) {
            return Err("Invalid hex color format. Use #RRGGBB format".into());
        }
    }

    // 6. Waqf types validation
    if category.associated_waqf_types.is_empty() {
        return Err("At least one waqf type must be associated with the category".into());
    }

    for waqf_type in &category.associated_waqf_types {
        validate_waqf_type(waqf_type)?;
    }

    // 7. Timestamp validation
    if category.created_at.trim().is_empty() {
        return Err("Created at timestamp is required".into());
    }

    if category.updated_at.trim().is_empty() {
        return Err("Updated at timestamp is required".into());
    }

    Ok(())
}

/// Validate subcategory data structure
fn validate_subcategory_data(subcategory: &Subcategory) -> std::result::Result<(), String> {
    // 1. ID validation
    if subcategory.id.trim().is_empty() {
        return Err("Subcategory ID is required".into());
    }

    if subcategory.id.len() > 100 {
        return Err("Subcategory ID must be 100 characters or less".into());
    }

    // 2. Category ID validation (parent reference)
    if subcategory.category_id.trim().is_empty() {
        return Err("Parent category ID is required".into());
    }

    // 3. Name validation
    if subcategory.name.trim().is_empty() {
        return Err("Subcategory name is required".into());
    }

    if subcategory.name.len() > 200 {
        return Err("Subcategory name must be 200 characters or less".into());
    }

    // 4. Description validation
    if subcategory.description.trim().is_empty() {
        return Err("Subcategory description is required".into());
    }

    if subcategory.description.len() > 1000 {
        return Err("Subcategory description must be 1000 characters or less".into());
    }

    // 5. Icon validation
    if subcategory.icon.trim().is_empty() {
        return Err("Subcategory icon is required".into());
    }

    // 6. Examples validation
    for example in &subcategory.examples {
        if example.len() > 200 {
            return Err("Each example must be 200 characters or less".into());
        }
    }

    // 7. Timestamp validation
    if subcategory.created_at.trim().is_empty() {
        return Err("Created at timestamp is required".into());
    }

    if subcategory.updated_at.trim().is_empty() {
        return Err("Updated at timestamp is required".into());
    }

    Ok(())
}

/// Validate hex color format
fn is_valid_hex_color(color: &str) -> bool {
    if !color.starts_with('#') {
        return false;
    }

    let hex = &color[1..];
    
    // Must be 6 characters (RGB)
    if hex.len() != 6 {
        return false;
    }

    // All characters must be valid hex digits
    hex.chars().all(|c| c.is_ascii_hexdigit())
}

/// Validate waqf type
fn validate_waqf_type(waqf_type: &str) -> std::result::Result<(), String> {
    let valid_types = ["permanent", "temporary_consumable", "temporary_revolving"];
    
    if !valid_types.contains(&waqf_type) {
        return Err(format!(
            "Invalid waqf type '{}'. Valid types: {}",
            waqf_type,
            valid_types.join(", ")
        ));
    }

    Ok(())
}

/// Main assertion function for category operations
pub fn assert_category_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Decode category data
    let category: Category = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid category data structure: {}", e))?;
    
    // Validate the category data
    validate_category_data(&category)?;
    
    // Log validation success
    ic_cdk::println!(
        "Category validation passed: {} - Active: {}, Types: {:?}",
        category.name,
        category.is_active,
        category.associated_waqf_types
    );
    
    Ok(())
}

/// Deletion assertion for categories
pub fn assert_category_deletion(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Get the category being deleted
    let current_doc = context.data.data.current.as_ref()
        .ok_or("No current document found for deletion")?;
    let category_to_delete: Category = decode_doc_data(&current_doc.data)
        .map_err(|e| format!("Cannot decode category data for deletion: {}", e))?;
    
    // Warning: In production, you should check if any subcategories or causes reference this category
    // For now, we'll just log the deletion
    ic_cdk::println!(
        "Category deletion: {} - Active: {}",
        category_to_delete.name,
        category_to_delete.is_active
    );
    
    Ok(())
}

/// Handle category changes
pub fn handle_category_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let category_data: Category = decode_doc_data(&context.data.data.after.data)?;
    
    let operation_type = if context.data.data.before.is_none() {
        "CREATE"
    } else {
        "UPDATE"
    };
    
    ic_cdk::println!(
        "Category {}: {} - Name: '{}', Active: {}, Types: {:?}",
        operation_type,
        context.data.key,
        category_data.name,
        category_data.is_active,
        category_data.associated_waqf_types
    );
    
    Ok(())
}

/// Main assertion function for subcategory operations
pub fn assert_subcategory_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Decode subcategory data
    let subcategory: Subcategory = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid subcategory data structure: {}", e))?;
    
    // Validate the subcategory data
    validate_subcategory_data(&subcategory)?;
    
    // Log validation success
    ic_cdk::println!(
        "Subcategory validation passed: {} - Parent: {}, Active: {}",
        subcategory.name,
        subcategory.category_id,
        subcategory.is_active
    );
    
    Ok(())
}

/// Deletion assertion for subcategories
pub fn assert_subcategory_deletion(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Get the subcategory being deleted
    let current_doc = context.data.data.current.as_ref()
        .ok_or("No current document found for deletion")?;
    let subcategory_to_delete: Subcategory = decode_doc_data(&current_doc.data)
        .map_err(|e| format!("Cannot decode subcategory data for deletion: {}", e))?;
    
    // Warning: In production, you should check if any causes reference this subcategory
    ic_cdk::println!(
        "Subcategory deletion: {} - Parent: {}",
        subcategory_to_delete.name,
        subcategory_to_delete.category_id
    );
    
    Ok(())
}

/// Handle subcategory changes
pub fn handle_subcategory_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let subcategory_data: Subcategory = decode_doc_data(&context.data.data.after.data)?;
    
    let operation_type = if context.data.data.before.is_none() {
        "CREATE"
    } else {
        "UPDATE"
    };
    
    ic_cdk::println!(
        "Subcategory {}: {} - Name: '{}', Parent: {}, Active: {}",
        operation_type,
        context.data.key,
        subcategory_data.name,
        subcategory_data.category_id,
        subcategory_data.is_active
    );
    
    Ok(())
}
