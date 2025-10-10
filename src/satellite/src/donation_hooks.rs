use crate::waqf_types::DonationData;
use junobuild_satellite::{OnSetDocContext, AssertSetDocContext, AssertDeleteDocContext};
use junobuild_utils::decode_doc_data;

// Validation constants
const MIN_DONATION_AMOUNT: f64 = 0.01;
const MAX_DONATION_AMOUNT: f64 = 1_000_000.0;
const VALID_DONATION_STATUSES: &[&str] = &["completed", "pending", "failed"];
const VALID_CURRENCIES: &[&str] = &["USD", "EUR", "GBP", "SAR", "AED"];

pub fn assert_donation_operations(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Decode donation data
    let donation: DonationData = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid donation data structure: {}", e))?;
    
    // Validate donation data
    validate_donation_data(&donation)?;
    
    ic_cdk::println!(
        "Donation validation passed: {} - Amount: {} {}, Status: {}", 
        donation.id, donation.amount, donation.currency, donation.status
    );
    
    Ok(())
}

pub fn assert_donation_deletion(_context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Generally allow donation deletion for admin purposes
    // Could add business rules here if needed
    ic_cdk::println!("Donation deletion requested");
    Ok(())
}

pub fn handle_donation_changes(context: OnSetDocContext) -> std::result::Result<(), String> {
    let donation: DonationData = decode_doc_data(&context.data.data.after.data)
        .map_err(|e| format!("Cannot decode donation data: {}", e))?;
    
    let operation_type = if context.data.data.before.is_none() {
        "CREATE"
    } else {
        "UPDATE"
    };
    
    ic_cdk::println!(
        "Donation {}: {} - WaqfID: {}, Amount: {} {}, Status: {}",
        operation_type,
        donation.id,
        donation.waqf_id,
        donation.amount,
        donation.currency,
        donation.status
    );
    
    Ok(())
}

fn validate_donation_data(donation: &DonationData) -> std::result::Result<(), String> {
    // Validate ID
    if donation.id.trim().is_empty() {
        return Err("Donation ID cannot be empty".into());
    }
    
    // Validate waqf_id
    if donation.waqf_id.trim().is_empty() {
        return Err("Waqf ID cannot be empty".into());
    }
    
    // Validate amount
    if donation.amount < MIN_DONATION_AMOUNT {
        return Err(format!("Donation amount too low: minimum {} {}", MIN_DONATION_AMOUNT, donation.currency));
    }
    
    if donation.amount > MAX_DONATION_AMOUNT {
        return Err(format!("Donation amount too high: maximum {} {}", MAX_DONATION_AMOUNT, donation.currency));
    }
    
    // Validate currency
    if !VALID_CURRENCIES.contains(&donation.currency.as_str()) {
        return Err(format!("Invalid currency: {}. Valid currencies: {}", donation.currency, VALID_CURRENCIES.join(", ")));
    }
    
    // Validate status
    if !VALID_DONATION_STATUSES.contains(&donation.status.as_str()) {
        return Err(format!("Invalid donation status: {}. Valid statuses: {}", donation.status, VALID_DONATION_STATUSES.join(", ")));
    }
    
    // Validate date format (should be ISO string)
    if donation.date.trim().is_empty() {
        return Err("Donation date cannot be empty".into());
    }
    
    // Validate donor name if provided
    if let Some(donor_name) = &donation.donor_name {
        if donor_name.trim().is_empty() {
            return Err("Donor name cannot be empty if provided".into());
        }
        if donor_name.len() > 100 {
            return Err("Donor name too long: maximum 100 characters".into());
        }
    }
    
    Ok(())
}