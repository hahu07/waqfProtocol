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
    pub total_donations: f64,
    pub total_distributed: f64,
    pub current_balance: f64,
    pub investment_returns: Vec<f64>,
    pub total_investment_return: f64,
    pub growth_rate: f64,
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
pub struct ContributionTranche {
    pub id: String,
    pub amount: f64,
    pub contribution_date: String,
    pub maturity_date: String,
    pub is_returned: bool,
    pub returned_date: Option<String>,
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
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct InvestmentStrategy {
    pub asset_allocation: String,        // e.g., "60% Sukuk, 40% Equity"
    pub expected_annual_return: f64,
    pub distribution_frequency: String,  // "monthly" | "quarterly" | "annually"
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct HybridAllocation {
    pub permanent: Option<f64>,             // Percentage allocated to permanent waqf
    pub temporary_consumable: Option<f64>,  // Percentage allocated to consumable waqf
    pub temporary_revolving: Option<f64>,   // Percentage allocated to revolving waqf
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct HybridCauseAllocation {
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
    pub waqf_asset: f64,
    pub donor: DonorProfile,
    pub selected_causes: Vec<String>,
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