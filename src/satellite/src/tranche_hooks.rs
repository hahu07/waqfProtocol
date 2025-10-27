use crate::waqf_types::{WaqfData, ContributionTranche};
use junobuild_satellite::{OnSetDocContext, AssertSetDocContext, AssertDeleteDocContext};
use junobuild_utils::{decode_doc_data, encode_doc_data};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TrancheReturnRequest {
    pub waqf_id: String,
    pub tranche_id: String,
    pub requested_by: String,
    pub timestamp: u64,
}

/// Validates and processes a tranche return request
pub fn assert_tranche_return_operations(
    context: AssertSetDocContext,
) -> std::result::Result<(), String> {
    let caller = context.caller.to_text();
    
    // Decode the tranche return request
    let request_result: std::result::Result<TrancheReturnRequest, _> = 
        decode_doc_data(&context.data.doc.data);
    
    let request = match request_result {
        Ok(req) => req,
        Err(e) => {
            ic_cdk::println!("ERROR: Failed to decode tranche return request: {:?}", e);
            return Err("Invalid tranche return request format".to_string());
        }
    };
    
    ic_cdk::println!(
        "TRANCHE RETURN: Request from {} to return tranche {} for waqf {}",
        caller, request.tranche_id, request.waqf_id
    );
    
    // Verify caller owns the waqf
    // Note: In production, you'd fetch the waqf and verify ownership
    // For now, we trust the request contains valid waqf_id
    
    Ok(())
}

pub fn assert_tranche_return_deletion(
    _context: AssertDeleteDocContext,
) -> std::result::Result<(), String> {
    // Tranche return records should not be deleted
    Err("Tranche return records cannot be deleted for audit purposes".to_string())
}

pub fn handle_tranche_return_changes(
    context: OnSetDocContext,
) -> std::result::Result<(), String> {
    let request_result: std::result::Result<TrancheReturnRequest, _> = 
        decode_doc_data(&context.data.doc.data);
    
    let request = match request_result {
        Ok(req) => req,
        Err(e) => {
            ic_cdk::println!("ERROR: Failed to decode tranche return in handler: {:?}", e);
            return Ok(()); // Don't fail the operation, just log
        }
    };
    
    ic_cdk::println!(
        "TRANCHE RETURN PROCESSED: Tranche {} returned for waqf {} by {}",
        request.tranche_id, request.waqf_id, request.requested_by
    );
    
    // The actual tranche status update happens on the waqf document itself
    // This is just an audit record
    
    Ok(())
}

/// Helper function to mark a tranche as returned in a waqf document
pub fn mark_tranche_as_returned(
    waqf: &mut WaqfData,
    tranche_id: &str,
    return_date: u64,
) -> std::result::Result<(), String> {
    // Check if waqf has revolving details
    let revolving_details = match &mut waqf.revolving_details {
        Some(details) => details,
        None => {
            return Err("Waqf is not a revolving waqf".to_string());
        }
    };
    
    // Find the tranche
    let tranche = revolving_details
        .contribution_tranches
        .iter_mut()
        .find(|t| t.id == tranche_id)
        .ok_or_else(|| format!("Tranche {} not found", tranche_id))?;
    
    // Check if already returned
    if tranche.is_returned {
        return Err("Tranche has already been returned".to_string());
    }
    
    // Check if matured
    let now = ic_cdk::api::time();
    let maturity_date = tranche.maturity_date
        .parse::<u64>()
        .map_err(|_| "Invalid maturity date format")?;
    
    if now < maturity_date {
        return Err(format!(
            "Tranche has not matured yet. Matures at: {}",
            tranche.maturity_date
        ));
    }
    
    // Mark as returned
    tranche.is_returned = true;
    tranche.returned_date = Some(return_date.to_string());
    
    // Update waqf financial state
    // Reduce current balance by returned amount
    waqf.financial.current_balance = 
        (waqf.financial.current_balance - tranche.amount).max(0.0);
    
    ic_cdk::println!(
        "SUCCESS: Tranche {} (${}) marked as returned for waqf {}. New balance: ${}",
        tranche_id,
        tranche.amount,
        waqf.id,
        waqf.financial.current_balance
    );
    
    Ok(())
}

/// Validate that all required fields are present in revolving waqf tranches
pub fn validate_tranche_data(tranche: &ContributionTranche) -> std::result::Result<(), String> {
    if tranche.id.is_empty() {
        return Err("Tranche ID cannot be empty".to_string());
    }
    
    if tranche.amount <= 0.0 {
        return Err("Tranche amount must be positive".to_string());
    }
    
    if tranche.contribution_date.is_empty() {
        return Err("Contribution date is required".to_string());
    }
    
    if tranche.maturity_date.is_empty() {
        return Err("Maturity date is required".to_string());
    }
    
    // Validate date format (should be nanosecond timestamps as strings)
    tranche.contribution_date
        .parse::<u64>()
        .map_err(|_| "Invalid contribution date format")?;
    
    tranche.maturity_date
        .parse::<u64>()
        .map_err(|_| "Invalid maturity date format")?;
    
    if let Some(ref returned) = tranche.returned_date {
        if !returned.is_empty() {
            returned
                .parse::<u64>()
                .map_err(|_| "Invalid returned date format")?;
        }
    }
    
    Ok(())
}
