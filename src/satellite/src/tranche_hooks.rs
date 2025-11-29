use crate::waqf_types::{WaqfData, ContributionTranche, InstallmentPayment};
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
    
    let is_early_withdrawal = now < maturity_date;
    if is_early_withdrawal && !revolving_details.early_withdrawal_allowed {
        return Err(format!(
            "Early withdrawals are not allowed for this waqf. Tranche matures at: {}",
            tranche.maturity_date
        ));
    }

    let penalty_rate = if is_early_withdrawal {
        revolving_details.early_withdrawal_penalty.unwrap_or(0.0)
    } else {
        0.0
    };

    let penalty_amount = (tranche.amount * penalty_rate).max(0.0);
    let amount_to_return_total = (tranche.amount - penalty_amount).max(0.0);
    let uses_installments = matches!(
        revolving_details.principal_return_method.as_str(),
        "installments"
    ) && revolving_details.installment_schedule.is_some();

    let mut amount_returned_now = amount_to_return_total;
    let mut tranche_status = "returned".to_string();
    let mut is_returned_flag = true;
    let mut returned_date_value: Option<String> = Some(return_date.to_string());

    if uses_installments {
        if tranche.installment_payments.is_none() {
            if let Some(schedule) = &revolving_details.installment_schedule {
                let installments = schedule.number_of_installments.max(1);
                let interval_days = match schedule.frequency.as_str() {
                    "monthly" => 30_u64,
                    "quarterly" => 90_u64,
                    "annually" => 365_u64,
                    _ => 30_u64,
                };
                let interval_nanos =
                    interval_days * 24 * 60 * 60 * 1_000_000_000;
                let per_installment_amount = amount_to_return_total / installments as f64;

                let mut payments: Vec<InstallmentPayment> = Vec::new();
                for index in 0..installments {
                    let due_date_nanos =
                        now + interval_nanos.saturating_mul((index + 1) as u64);
                    payments.push(InstallmentPayment {
                        id: format!("inst_{}_{}", tranche_id, index + 1),
                        amount: per_installment_amount,
                        due_date: due_date_nanos.to_string(),
                        status: "scheduled".to_string(),
                        paid_date: None,
                    });
                }
                tranche.installment_payments = Some(payments);
            }
        }

        tranche_status = "return_scheduled".to_string();
        is_returned_flag = false;
        returned_date_value = None;
        amount_returned_now = 0.0;

        let notification = format!(
            "Installment schedule created for tranche {}. Total to return: {:.2}",
            tranche_id, amount_to_return_total
        );
        if let Some(ref mut notifications) = revolving_details.pending_notifications {
            notifications.push(notification);
        } else {
            revolving_details.pending_notifications = Some(vec![notification]);
        }
    } else if !is_early_withdrawal {
        if let Some(pref) = &revolving_details.auto_rollover_preference {
            if pref != "none" {
                let lock_period_nanos = (revolving_details.lock_period_months as u64)
                    * 30 * 24 * 60 * 60 * 1_000_000_000;
                let new_maturity = now + lock_period_nanos;
                let new_tranche_id =
                    format!("tranche_rollover_{}_{}", tranche_id, now);
                let new_tranche = ContributionTranche {
                    id: new_tranche_id.clone(),
                    amount: amount_to_return_total,
                    contribution_date: now.to_string(),
                    maturity_date: new_maturity.to_string(),
                    is_returned: false,
                    returned_date: None,
                    status: Some("locked".to_string()),
                    penalty_applied: None,
                    rollover_origin_id: Some(tranche_id.to_string()),
                    rollover_target_id: None,
                    installment_payments: None,
                    // Preserve expiration preference from original tranche
                    expiration_preference: tranche.expiration_preference.clone(),
                    conversion_details: None,
                };

                if let Some(target_cause) =
                    &revolving_details.auto_rollover_target_cause
                {
                    let notification = format!(
                        "Matured tranche {} rolled over into {} for cause {}",
                        tranche_id, new_tranche_id, target_cause
                    );
                    if let Some(ref mut notifications) =
                        revolving_details.pending_notifications
                    {
                        notifications.push(notification);
                    } else {
                        revolving_details.pending_notifications =
                            Some(vec![notification]);
                    }
                } else {
                    let notification = format!(
                        "Matured tranche {} rolled over into {} (strategy: {})",
                        tranche_id, new_tranche_id, pref
                    );
                    if let Some(ref mut notifications) =
                        revolving_details.pending_notifications
                    {
                        notifications.push(notification);
                    } else {
                        revolving_details.pending_notifications =
                            Some(vec![notification]);
                    }
                }

                if let Some(ref mut tranches) = revolving_details.contribution_tranches {
                    tranches.push(new_tranche);
                } else {
                    revolving_details.contribution_tranches = Some(vec![new_tranche]);
                }

                tranche.rollover_target_id = Some(new_tranche_id);
                tranche_status = "rolled_over".to_string();
                amount_returned_now = 0.0;
            }
        }
    }

    // Mark tranche metadata
    tranche.is_returned = is_returned_flag;
    tranche.returned_date = returned_date_value;
    tranche.penalty_applied = if penalty_amount > 0.0 {
        Some(penalty_amount)
    } else {
        None
    };
    tranche.status = Some(tranche_status.clone());

    if is_early_withdrawal {
        let notification = format!(
            "Early withdrawal processed for tranche {}. Penalty applied: {:.2}",
            tranche_id, penalty_amount
        );
        if let Some(ref mut notifications) = revolving_details.pending_notifications {
            notifications.push(notification);
        } else {
            revolving_details.pending_notifications = Some(vec![notification]);
        }
    }

    // Update waqf financial state
    waqf.financial.current_balance =
        (waqf.financial.current_balance - amount_returned_now).max(0.0);

    ic_cdk::println!(
        "SUCCESS: Tranche {} (${:.2}) processed for waqf {}. Returned: ${:.2}, Penalty: ${:.2}",
        tranche_id,
        tranche.amount,
        waqf.id,
        amount_returned_now,
        penalty_amount
    );

    Ok(())
}

/// Validate expiration preference settings
pub fn validate_expiration_preference(
    preference: &crate::waqf_types::TrancheExpirationPreference,
) -> std::result::Result<(), String> {
    use crate::waqf_types::ExpirationAction;
    
    match preference.action {
        ExpirationAction::Refund => {
            // No additional validation needed for refund
            Ok(())
        },
        ExpirationAction::Rollover => {
            // Validate rollover months if present
            if let Some(months) = preference.rollover_months {
                if months < 1 {
                    return Err("Rollover period must be at least 1 month".to_string());
                }
                if months > 240 {
                    return Err("Rollover period cannot exceed 240 months (20 years)".to_string());
                }
            } else {
                return Err("Rollover action requires rollover_months to be specified".to_string());
            }
            Ok(())
        },
        ExpirationAction::ConvertPermanent => {
            // No specific validation needed for permanent conversion
            // Investment strategy will be provided at conversion time
            Ok(())
        },
        ExpirationAction::ConvertConsumable => {
            // Validate consumable schedule if present
            if let Some(ref schedule) = preference.consumable_schedule {
                match schedule.as_str() {
                    "immediate" | "phased" | "milestone-based" | "ongoing" => {},
                    _ => return Err(format!("Invalid consumable schedule: {}", schedule)),
                }
            }
            
            // Validate consumable duration if present
            if let Some(duration) = preference.consumable_duration {
                if duration < 1 {
                    return Err("Consumable duration must be at least 1 month".to_string());
                }
                if duration > 60 {
                    return Err("Consumable duration cannot exceed 60 months".to_string());
                }
            }
            
            Ok(())
        },
    }
}

/// Validate that a tranche can be converted
pub fn validate_tranche_conversion(
    tranche: &ContributionTranche,
    waqf: &WaqfData,
) -> std::result::Result<(), String> {
    // Check if tranche is already returned
    if tranche.is_returned {
        return Err("Cannot convert an already returned tranche".to_string());
    }
    
    // Check if tranche has already been converted
    if tranche.conversion_details.is_some() {
        return Err("Tranche has already been converted".to_string());
    }
    
    // Check if tranche is rolled over
    if let Some(ref status) = tranche.status {
        if status == "rolled_over" {
            return Err("Cannot convert a rolled-over tranche".to_string());
        }
    }
    
    // Check if tranche has matured
    let now = ic_cdk::api::time();
    let maturity_date = tranche.maturity_date
        .parse::<u64>()
        .map_err(|_| "Invalid maturity date format")?;
    
    if now < maturity_date {
        let days_until = (maturity_date - now) / (24 * 60 * 60 * 1_000_000_000);
        return Err(format!(
            "Tranche has not matured yet. Matures in {} days",
            days_until
        ));
    }
    
    // Verify waqf has sufficient balance
    if waqf.financial.current_balance < tranche.amount {
        return Err(format!(
            "Insufficient waqf balance for conversion. Required: {}, Available: {}",
            tranche.amount,
            waqf.financial.current_balance
        ));
    }
    
    ic_cdk::println!(
        "VALIDATION: Tranche {} is eligible for conversion (Amount: {}, Matured: true)",
        tranche.id,
        tranche.amount
    );
    
    Ok(())
}

/// Validate that a tranche can be rolled over
pub fn validate_tranche_rollover(
    tranche: &ContributionTranche,
    rollover_months: u32,
) -> std::result::Result<(), String> {
    // Check if tranche is already returned
    if tranche.is_returned {
        return Err("Cannot rollover an already returned tranche".to_string());
    }
    
    // Check if tranche has already been rolled over
    if let Some(ref status) = tranche.status {
        if status == "rolled_over" {
            return Err("Tranche has already been rolled over".to_string());
        }
    }
    
    // Check if tranche has matured
    let now = ic_cdk::api::time();
    let maturity_date = tranche.maturity_date
        .parse::<u64>()
        .map_err(|_| "Invalid maturity date format")?;
    
    if now < maturity_date {
        return Err("Tranche has not matured yet".to_string());
    }
    
    // Validate rollover period
    if rollover_months < 1 {
        return Err("Rollover period must be at least 1 month".to_string());
    }
    if rollover_months > 240 {
        return Err("Rollover period cannot exceed 240 months (20 years)".to_string());
    }
    
    ic_cdk::println!(
        "VALIDATION: Tranche {} is eligible for rollover (Period: {} months)",
        tranche.id,
        rollover_months
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

    if let Some(ref status) = tranche.status {
        match status.as_str() {
            "locked" | "matured" | "return_scheduled" | "returned" | "rolled_over" => {}
            other => {
                return Err(format!("Invalid tranche status: {}", other));
            }
        }
    }

    if let Some(penalty) = tranche.penalty_applied {
        if penalty < 0.0 {
            return Err("Penalty applied cannot be negative".to_string());
        }
    }

    if let Some(ref payments) = tranche.installment_payments {
        for payment in payments {
            if payment.amount <= 0.0 {
                return Err("Installment payment amount must be positive".to_string());
            }

            if payment.due_date.is_empty() {
                return Err("Installment payment due date is required".to_string());
            }

            payment
                .due_date
                .parse::<u64>()
                .map_err(|_| "Invalid installment payment due date format")?;

            if let Some(ref paid_date) = payment.paid_date {
                if !paid_date.is_empty() {
                    paid_date
                        .parse::<u64>()
                        .map_err(|_| "Invalid installment payment paid date format")?;
                }
            }

            match payment.status.as_str() {
                "scheduled" | "paid" | "missed" => {}
                other => {
                    return Err(format!("Invalid installment payment status: {}", other));
                }
            }
        }
    }
    
    // Validate expiration preference if present
    if let Some(ref pref) = tranche.expiration_preference {
        validate_expiration_preference(pref)?;
    }
    
    // Validate conversion details if present
    if let Some(ref conversion) = tranche.conversion_details {
        if conversion.converted_at.is_empty() {
            return Err("Conversion timestamp cannot be empty".to_string());
        }
        
        if conversion.new_waqf_id.is_empty() {
            return Err("New waqf ID cannot be empty in conversion details".to_string());
        }
        
        if conversion.target_waqf_type.is_empty() {
            return Err("Target waqf type cannot be empty in conversion details".to_string());
        }
        
        match conversion.target_waqf_type.as_str() {
            "permanent" | "temporary_consumable" => {},
            other => return Err(format!("Invalid target waqf type in conversion: {}", other)),
        }
    }
    
    Ok(())
}
