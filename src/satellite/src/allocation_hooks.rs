use crate::waqf_types::AllocationData;
use junobuild_satellite::{OnSetDocContext, AssertSetDocContext, AssertDeleteDocContext};
use junobuild_utils::decode_doc_data;

// Validation constants
const MIN_ALLOCATION_AMOUNT: f64 = 0.01;
const MAX_ALLOCATION_AMOUNT: f64 = 10_000_000.0;
const MIN_RATIONALE_LENGTH: usize = 5;
const MAX_RATIONALE_LENGTH: usize = 500;

pub fn assert_allocation_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Decode allocation data
    let allocation: AllocationData = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid allocation data structure: {}", e))?;
    
    // Validate allocation data
    validate_allocation_data(&allocation)?;
    
    ic_cdk::println!(
        "Allocation validation passed: {} - Waqf: {}, Cause: {}, Amount: {}", 
        allocation.id, allocation.waqf_id, allocation.cause_id, allocation.amount
    );
    
    Ok(())
}

pub fn assert_allocation_deletion(_context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Allow allocation deletion for admin purposes
    // Could add business rules for preventing deletion of completed allocations
    ic_cdk::println!("Allocation deletion requested");
    Ok(())
}

pub fn handle_allocation_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let allocation: AllocationData = decode_doc_data(&context.data.data.after.data)
        .map_err(|e| format!("Cannot decode allocation data: {}", e))?;
    
    let operation_type = if context.data.data.before.is_none() {
        "CREATE"
    } else {
        "UPDATE"
    };
    
    ic_cdk::println!(
        "Allocation {}: {} - Waqf: {}, Cause: {}, Amount: {}",
        operation_type,
        allocation.id,
        allocation.waqf_id,
        allocation.cause_id,
        allocation.amount
    );
    
    // Log high-value allocations for audit
    if allocation.amount > 10000.0 {
        ic_cdk::println!(
            "HIGH-VALUE ALLOCATION: {} allocated {} to cause {}",
            allocation.waqf_id,
            allocation.amount,
            allocation.cause_id
        );
    }
    
    Ok(())
}

fn validate_allocation_data(allocation: &AllocationData) -> std::result::Result<(), String> {
    // Validate ID
    if allocation.id.trim().is_empty() {
        return Err("Allocation ID cannot be empty".into());
    }
    
    // Validate waqf_id
    if allocation.waqf_id.trim().is_empty() {
        return Err("Waqf ID cannot be empty".into());
    }
    
    // Validate cause_id
    if allocation.cause_id.trim().is_empty() {
        return Err("Cause ID cannot be empty".into());
    }
    
    // Validate amount
    if allocation.amount < MIN_ALLOCATION_AMOUNT {
        return Err(format!("Allocation amount too low: minimum {}", MIN_ALLOCATION_AMOUNT));
    }
    
    if allocation.amount > MAX_ALLOCATION_AMOUNT {
        return Err(format!("Allocation amount too high: maximum {}", MAX_ALLOCATION_AMOUNT));
    }
    
    // Validate rationale
    let rationale = allocation.rationale.trim();
    if rationale.is_empty() {
        return Err("Allocation rationale cannot be empty".into());
    }
    
    if rationale.len() < MIN_RATIONALE_LENGTH {
        return Err(format!("Allocation rationale too short: minimum {} characters", MIN_RATIONALE_LENGTH));
    }
    
    if rationale.len() > MAX_RATIONALE_LENGTH {
        return Err(format!("Allocation rationale too long: maximum {} characters", MAX_RATIONALE_LENGTH));
    }
    
    // Validate allocated_at timestamp
    if allocation.allocated_at.trim().is_empty() {
        return Err("Allocation timestamp cannot be empty".into());
    }
    
    // Check for suspicious patterns in rationale
    let suspicious_words = ["test", "dummy", "fake", "xxx"];
    let rationale_lower = rationale.to_lowercase();
    for word in suspicious_words {
        if rationale_lower.contains(word) {
            return Err(format!("Allocation rationale contains suspicious content: {}", word));
        }
    }
    
    Ok(())
}