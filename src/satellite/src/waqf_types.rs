use serde::{Deserialize, Serialize};
use candid::CandidType;

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct WaqfDoc {
    pub data: WaqfData,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
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

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct WaqfData {
    pub id: String,
    pub name: String,
    pub description: String,
    pub waqf_asset: f64,
    pub donor: DonorProfile,
    pub selected_causes: Vec<String>,
    pub status: String, // "active" | "paused" | "completed" | "inactive" | "archived"
    pub is_donated: Option<bool>,
    pub notifications: NotificationPreferences,
    pub reporting_preferences: ReportingPreferences,
    pub financial: FinancialMetrics,
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