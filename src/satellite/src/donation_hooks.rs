use crate::waqf_types::{DonationData, WaqfData};
use junobuild_satellite::{OnSetDocContext, AssertSetDocContext, AssertDeleteDocContext, get_doc, set_doc, SetDoc};
use junobuild_utils::{decode_doc_data, encode_doc_data};

// Validation constants
const MIN_DONATION_AMOUNT: f64 = 0.01;
const MAX_DONATION_AMOUNT: f64 = 1_000_000.0;
const VALID_DONATION_STATUSES: &[&str] = &["completed", "pending", "failed"];
const VALID_CURRENCIES: &[&str] = &["USD", "EUR", "GBP", "SAR", "AED", "NGN", "KES", "GHS", "ZAR", "INR"];

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
    
    let is_new_donation = context.data.data.before.is_none();
    let operation_type = if is_new_donation { "CREATE" } else { "UPDATE" };
    
    ic_cdk::println!(
        "Donation {}: {} - WaqfID: {}, Amount: {} {}, Status: {}",
        operation_type,
        donation.id,
        donation.waqf_id,
        donation.amount,
        donation.currency,
        donation.status
    );
    
    // Only update waqf financial metrics for new completed donations
    if is_new_donation && donation.status == "completed" {
        update_waqf_financials(&donation)?;
    }
    
    Ok(())
}

fn validate_donation_data(donation: &DonationData) -> std::result::Result<(), String> {
    // Validate waqf_id
    if donation.waqf_id.trim().is_empty() {
        return Err("Waqf ID cannot be empty".into());
    }

    // Validate amount
    if donation.amount < MIN_DONATION_AMOUNT {
        return Err(format!(
            "Donation amount too low: minimum {} {}",
            MIN_DONATION_AMOUNT, donation.currency
        ));
    }

    if donation.amount > MAX_DONATION_AMOUNT {
        return Err(format!(
            "Donation amount too high: maximum {} {}",
            MAX_DONATION_AMOUNT, donation.currency
        ));
    }

    // Validate currency
    if !VALID_CURRENCIES.contains(&donation.currency.as_str()) {
        return Err(format!(
            "Invalid currency: {}. Valid currencies: {}",
            donation.currency,
            VALID_CURRENCIES.join(", ")
        ));
    }

    // Validate status
    if !VALID_DONATION_STATUSES.contains(&donation.status.as_str()) {
        return Err(format!(
            "Invalid donation status: {}. Valid statuses: {}",
            donation.status,
            VALID_DONATION_STATUSES.join(", ")
        ));
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

fn update_waqf_financials(donation: &DonationData) -> std::result::Result<(), String> {
    let waqf_id = &donation.waqf_id;
    let donation_amount = donation.amount;

    // Get the waqf document
    let waqf_doc = get_doc("waqfs".to_string(), waqf_id.to_string());

    if waqf_doc.is_none() {
        return Err(format!("Waqf not found: {}", waqf_id));
    }

    let doc = waqf_doc.unwrap();

    // Decode waqf data directly (Juno stores data without wrapper)
    let mut waqf: WaqfData = decode_doc_data(&doc.data)
        .map_err(|e| format!("Failed to decode waqf data: {}", e))?;

    // Update financial metrics
    waqf.financial.total_donations += donation_amount;
    waqf.financial.current_balance += donation_amount;
    let current_time_nanos = ic_cdk::api::time();
    let current_time = current_time_nanos.to_string();
    waqf.updated_at = Some(current_time.clone());
    waqf.last_contribution_date = Some(current_time.clone());

    // Debug: Log waqf type
    ic_cdk::println!(
        "DEBUG - Waqf type check: waqf_id={}, waqf_type={:?}, has_revolving_details={}, custom_lock_months={:?}",
        waqf_id,
        waqf.waqf_type,
        waqf.revolving_details.is_some(),
        donation.lock_period_months
    );

    // If this waqf has a revolving slice, create a new contribution tranche
    use crate::waqf_types::{WaqfType, ContributionTranche};

    // Determine how much of this donation should be treated as "revolving"
    let mut revolving_donation_amount = 0.0;

    match waqf.waqf_type {
        WaqfType::TemporaryRevolving => {
            // Pure revolving waqf: entire donation is revolving
            revolving_donation_amount = donation_amount;
            ic_cdk::println!(
                "DEBUG - Pure TemporaryRevolving waqf: full donation is revolving slice"
            );
        }
        WaqfType::Hybrid => {
            // Hybrid: try to infer revolving ratio from existing tranches first
            let mut used_tranche_ratio = false;

            if let Some(ref revolving_details) = waqf.revolving_details {
                if let Some(ref tranches) = revolving_details.contribution_tranches {
                    let total_revolving: f64 = tranches.iter().map(|t| t.amount).sum();

                    if waqf.waqf_asset > 0.0 && total_revolving > 0.0 {
                        let ratio = total_revolving / waqf.waqf_asset;
                        revolving_donation_amount = donation_amount * ratio;
                        used_tranche_ratio = true;

                        ic_cdk::println!(
                            "DEBUG - Hybrid waqf donation (from tranches): donation_amount={}, total_revolving={}, waqf_asset={}, ratio={:.4}, slice={}",
                            donation_amount,
                            total_revolving,
                            waqf.waqf_asset,
                            ratio,
                            revolving_donation_amount
                        );
                    }
                }
            }

            if !used_tranche_ratio {
                // Fallback: use hybrid_allocations percentages if available
                if let Some(ref allocations) = waqf.hybrid_allocations {
                    let mut total_revolving_pct = 0.0;
                    for alloc in allocations {
                        total_revolving_pct +=
                            alloc.allocations.temporary_revolving.unwrap_or(0.0);
                    }

                    let avg_revolving_pct = if !allocations.is_empty() {
                        total_revolving_pct / allocations.len() as f64
                    } else {
                        0.0
                    };

                    revolving_donation_amount = (donation_amount * avg_revolving_pct) / 100.0;

                    ic_cdk::println!(
                        "DEBUG - Hybrid waqf donation (from hybrid_allocations): donation_amount={}, avg_revolving_pct={:.2}, revolving_slice={}",
                        donation_amount,
                        avg_revolving_pct,
                        revolving_donation_amount
                    );
                } else {
                    ic_cdk::println!(
                        "WARN - Hybrid waqf has no hybrid_allocations; skipping revolving tranche for donation on waqf {}",
                        waqf_id
                    );
                }
            }
        }
        _ => {
            // Non-revolving waqf types don't get tranches
        }
    }

    if revolving_donation_amount > 0.0 {
        if let Some(ref mut revolving_details) = waqf.revolving_details {
            ic_cdk::println!(
                "DEBUG - Creating tranche for donation revolving slice: waqf_id={}, amount={}, custom_lock_months={:?}",
                waqf_id,
                revolving_donation_amount,
                donation.lock_period_months
            );

            // Use per-contribution lock period if provided, otherwise fall back to waqf default
            let effective_lock_months: u32 = donation
                .lock_period_months
                .unwrap_or(revolving_details.lock_period_months);

            // Calculate maturity date for this tranche
            let lock_period_nanos = (effective_lock_months as u64)
                * 30
                * 24
                * 60
                * 60
                * 1_000_000_000; // Convert months to nanoseconds
            let maturity_time_nanos = current_time_nanos + lock_period_nanos;
            let maturity_date = maturity_time_nanos.to_string();

            // Create new tranche with expiration preference from waqf defaults
            let tranche_id = format!("tranche_{}_{}", waqf_id, current_time_nanos);
            let new_tranche = ContributionTranche {
                id: tranche_id.clone(),
                amount: revolving_donation_amount,
                contribution_date: current_time.clone(),
                maturity_date: maturity_date.clone(),
                is_returned: false,
                returned_date: None,
                status: Some("locked".to_string()),
                penalty_applied: None,
                rollover_origin_id: None,
                rollover_target_id: None,
                installment_payments: None,
                expiration_preference: revolving_details
                    .default_expiration_preference
                    .clone(),
                conversion_details: None,
            };

            ic_cdk::println!(
                "DEBUG - Creating tranche: ID={}, Amount={}, ContribDate={}, MaturityDate={}, HasExpirationPref={}",
                tranche_id,
                revolving_donation_amount,
                current_time,
                maturity_date,
                new_tranche.expiration_preference.is_some()
            );

            // Add to tranches array
            if let Some(ref mut tranches) = revolving_details.contribution_tranches {
                tranches.push(new_tranche);
            } else {
                revolving_details.contribution_tranches = Some(vec![new_tranche]);
            }

            ic_cdk::println!(
                "Created contribution tranche for waqf: revolving slice {} amount, matures in {} months",
                revolving_donation_amount,
                effective_lock_months
            );
        } else {
            ic_cdk::println!(
                "WARN - Waqf {:?} has no revolving_details but expected a revolving slice; skipping tranche",
                waqf.waqf_type
            );
        }
    }

    // Encode updated waqf data using Juno's encoding
    let updated_data = encode_doc_data(&waqf)
        .map_err(|e| format!("Failed to encode waqf data: {}", e))?;

    // Create SetDoc for update
    let set_doc_data = SetDoc {
        data: updated_data,
        description: doc.description,
        version: doc.version,
    };

    // Save updated waqf
    let _ = set_doc("waqfs".to_string(), waqf_id.to_string(), set_doc_data);

    ic_cdk::println!(
        "Updated waqf {} financials: +{} donation, new balance: {}",
        waqf_id,
        donation_amount,
        waqf.financial.current_balance
    );

    Ok(())
}
