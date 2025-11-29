use crate::impact_event_types::ImpactEvent;
use junobuild_satellite::{AssertDeleteDocContext, AssertSetDocContext, OnSetDocContext};
use junobuild_utils::decode_doc_data;

// ============================================
// VALIDATION FUNCTIONS
// ============================================

fn validate_impact_event_data(event: &ImpactEvent) -> Result<(), String> {
    // Use the built-in validation
    event.validate()?;

    // Additional business logic validation
    if event.beneficiary_count == 0 && event.amount > 0.0 {
        ic_cdk::println!(
            "⚠️  Warning: Impact event {} has amount but zero beneficiaries",
            event.id
        );
    }

    Ok(())
}

// ============================================
// ASSERTION FUNCTIONS
// ============================================

pub fn assert_impact_event_operations(
    context: AssertSetDocContext,
) -> Result<(), String> {
    // Decode impact event data
    let event: ImpactEvent = decode_doc_data(&context.data.data.proposed.data)
        .map_err(|e| format!("Invalid impact event data structure: {}", e))?;

    // Validate the impact event data
    validate_impact_event_data(&event)?;

    ic_cdk::println!(
        "✅ Impact event validation passed: {} - Type: {:?}, Amount: {}, Beneficiaries: {}",
        event.id,
        event.event_type,
        event.amount,
        event.beneficiary_count
    );

    Ok(())
}

pub fn assert_impact_event_deletion(
    _context: AssertDeleteDocContext,
) -> Result<(), String> {
    // Impact events can be deleted by admins for moderation purposes
    // No special restrictions needed
    Ok(())
}

// ============================================
// ON SET HOOK
// ============================================

pub fn handle_impact_event_changes(context: OnSetDocContext) -> Result<(), String> {
    let event: ImpactEvent = decode_doc_data(&context.data.data.after.data)?;

    // Log significant events
    if event.is_featured {
        ic_cdk::println!(
            "⭐ Featured impact event created: {} - {}",
            event.id,
            event.title
        );
    }

    // Log verification status changes
    if let Some(before_doc) = &context.data.data.before {
        let before_event: ImpactEvent = decode_doc_data(&before_doc.data)?;
        
        // Check if verification status changed
        let before_status = format!("{:?}", before_event.verification.status);
        let after_status = format!("{:?}", event.verification.status);
        
        if before_status != after_status {
            ic_cdk::println!(
                "🔍 Impact event {} verification status changed: {} -> {}",
                event.id,
                before_status,
                after_status
            );
        }
    }

    Ok(())
}

