use serde::{Deserialize, Serialize};
use candid::CandidType;

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct WaqfDoc {
    pub data: WaqfData,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct DonorProfile {
    pub name: String,
    pub email: String,
    pub phone: String,
    pub address: String,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct NotificationPreferences {
    pub contribution_reminders: bool,
    pub impact_reports: bool,
    pub financial_updates: bool,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ReportingPreferences {
    pub frequency: String, // "quarterly" | "semiannually" | "yearly"
    pub report_types: Vec<String>, // ["financial", "impact"]
    pub delivery_method: String, // "email" | "platform" | "both"
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct FinancialMetrics {
    #[serde(alias = "totalDonations")]
    pub total_donations: f64,
    #[serde(alias = "totalDistributed")]
    pub total_distributed: f64,
    #[serde(alias = "currentBalance")]
    pub current_balance: f64,
    #[serde(alias = "investmentReturns")]
    pub investment_returns: Vec<f64>,
    #[serde(alias = "totalInvestmentReturn")]
    pub total_investment_return: f64,
    #[serde(alias = "growthRate")]
    pub growth_rate: f64,
    #[serde(alias = "causeAllocations")]
    pub cause_allocations: std::collections::HashMap<String, f64>, // Amount allocated per cause
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum WaqfType {
    Permanent,              // Traditional perpetual waqf - principal preserved forever, returns distributed
    TemporaryConsumable,    // Principal + returns spent over time period
    TemporaryRevolving,     // Principal returned to donor, returns distributed
    Hybrid,                 // Mixed allocation across multiple waqf types
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Milestone {
    pub description: String,
    pub target_date: String,
    pub target_amount: f64,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ConsumableWaqfDetails {
    pub spending_schedule: String,       // "immediate" | "phased" | "milestone-based" | "ongoing"
    
    // Optional time boundaries
    pub start_date: Option<String>,      // ISO timestamp (optional for ongoing)
    pub end_date: Option<String>,        // ISO timestamp when all funds should be spent (optional)
    
    // Alternative completion criteria
    pub target_amount: Option<f64>,      // Target amount to be distributed before completion
    pub target_beneficiaries: Option<u32>, // Target number of beneficiaries to support
    
    // Spending parameters
    pub milestones: Option<Vec<Milestone>>, // Milestones if using milestone-based spending
    pub minimum_monthly_distribution: Option<f64>, // Minimum amount to distribute monthly (for ongoing)
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct InstallmentSchedule {
    pub frequency: String,               // "monthly" | "quarterly" | "annually"
    pub number_of_installments: u32,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct InstallmentPayment {
    pub id: String,
    pub amount: f64,
    pub due_date: String,
    pub status: String,                  // "scheduled" | "paid" | "missed"
    pub paid_date: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum ExpirationAction {
    Refund,              // Return principal to donor
    Rollover,            // Extend for another lock period
    ConvertPermanent,    // Convert to permanent waqf
    ConvertConsumable,   // Convert to consumable waqf
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct TrancheExpirationPreference {
    pub action: ExpirationAction,
    pub rollover_months: Option<u32>,
    pub rollover_cause_id: Option<String>,
    pub consumable_schedule: Option<String>,  // "immediate" | "phased" | "milestone-based" | "ongoing"
    pub consumable_duration: Option<u32>,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ConversionDetails {
    pub converted_at: String,
    pub new_waqf_id: String,
    pub target_waqf_type: String,  // "permanent" | "temporary_consumable"
    pub notes: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ContributionTranche {
    pub id: String,
    pub amount: f64,
    pub contribution_date: String,
    pub maturity_date: String,
    pub is_returned: bool,
    pub returned_date: Option<String>,
    pub status: Option<String>,                      // "locked" | "matured" | "return_scheduled" | "returned" | "rolled_over"
    pub penalty_applied: Option<f64>,                // Penalty amount applied on early withdrawal
    pub rollover_origin_id: Option<String>,          // If created via rollover, reference original tranche
    pub rollover_target_id: Option<String>,          // If this tranche rolled over into another tranche
    pub installment_payments: Option<Vec<InstallmentPayment>>,
    pub expiration_preference: Option<TrancheExpirationPreference>,  // Expiration action preference
    pub conversion_details: Option<ConversionDetails>,                // Details if converted to another waqf type
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct RevolvingWaqfDetails {
    pub lock_period_months: u32,         // Lock period in months
    pub maturity_date: String,           // ISO timestamp when principal will be returned (for initial)
    pub principal_return_method: String, // "lump_sum" | "installments"
    pub installment_schedule: Option<InstallmentSchedule>,
    pub early_withdrawal_penalty: Option<f64>, // Penalty percentage (e.g., 0.1 = 10%)
    pub early_withdrawal_allowed: bool,
    pub contribution_tranches: Option<Vec<ContributionTranche>>, // Track each contribution separately
    pub auto_rollover_preference: Option<String>,   // "none" | "same_cause" | "cause_pool"
    pub auto_rollover_target_cause: Option<String>, // Optional cause to target for rollover
    pub pending_notifications: Option<Vec<String>>, // Pending notifications to surface to donor
    pub default_expiration_preference: Option<TrancheExpirationPreference>, // Default expiration preference for new tranches
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct InvestmentStrategy {
    pub asset_allocation: String,        // e.g., "60% Sukuk, 40% Equity"
    pub expected_annual_return: f64,
    pub distribution_frequency: String,  // "monthly" | "quarterly" | "annually"
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct HybridAllocation {
    #[serde(alias = "Permanent")]
    pub permanent: Option<f64>,             // Percentage allocated to permanent waqf
    #[serde(alias = "TemporaryConsumable")]
    pub temporary_consumable: Option<f64>,  // Percentage allocated to consumable waqf
    #[serde(alias = "TemporaryRevolving")]
    pub temporary_revolving: Option<f64>,   // Percentage allocated to revolving waqf
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct HybridCauseAllocation {
    #[serde(alias = "causeId")]
    pub cause_id: String,
    pub allocations: HybridAllocation,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct DeedDocument {
    pub signed_at: String,
    pub donor_signature: String,
    pub document_version: String,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct WaqfData {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(alias = "waqfAsset")]
    pub waqf_asset: f64,
    pub donor: DonorProfile,
    #[serde(alias = "selectedCauses")]
    pub selected_causes: Vec<String>,
    #[serde(alias = "causeAllocation")]
    pub cause_allocation: std::collections::HashMap<String, f64>, // Percentage allocation per cause
    pub status: String, // "active" | "paused" | "completed" | "inactive" | "archived" | "terminated" | "matured"
    pub is_donated: Option<bool>,
    pub notifications: NotificationPreferences,
    pub reporting_preferences: ReportingPreferences,
    pub financial: FinancialMetrics,
    pub waqf_type: WaqfType, // Type of waqf (permanent, temporary_consumable, temporary_revolving, hybrid)
    pub is_hybrid: bool,     // Whether this waqf uses hybrid allocation
    pub hybrid_allocations: Option<Vec<HybridCauseAllocation>>, // Hybrid allocations per cause
    pub consumable_details: Option<ConsumableWaqfDetails>,      // Details for consumable waqf
    pub revolving_details: Option<RevolvingWaqfDetails>,        // Details for revolving waqf
    pub investment_strategy: Option<InvestmentStrategy>,        // Investment strategy for permanent portion
    pub deed_document: Option<DeedDocument>,                    // Stored waqf deed document data
    pub created_by: String,
    pub created_at: String, // ISO timestamp
    pub updated_at: Option<String>,
    pub last_contribution_date: Option<String>,
    pub next_contribution_date: Option<String>,
    pub next_report_date: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct DonationDoc {
    pub data: DonationData,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct DonationData {
    pub id: String,
    pub waqf_id: String,
    pub date: String, // ISO timestamp
    pub amount: f64,
    pub currency: String,
    pub status: String, // "completed" | "pending" | "failed"
    pub transaction_id: Option<String>,
    pub donor_name: Option<String>,
    pub lock_period_months: Option<u32>, // Optional custom lock period for this contribution
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct AllocationDoc {
    pub data: AllocationData,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct AllocationData {
    pub id: String,
    pub waqf_id: String,
    pub cause_id: String,
    pub amount: f64,
    pub rationale: String,
    pub allocated_at: String, // ISO timestamp
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct WaqfAudit {
    pub data: WaqfAuditData,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct WaqfAuditData {
    pub waqf_id: String,
    pub action: String,
    pub details: String,
    pub timestamp: u64,
    pub performed_by: String,
}
