use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "lowercase")]
pub enum ImpactEventType {
    Distribution,
    #[serde(rename = "milestone_completed")]
    MilestoneCompleted,
    #[serde(rename = "beneficiary_helped")]
    BeneficiaryHelped,
    #[serde(rename = "project_completed")]
    ProjectCompleted,
    #[serde(rename = "funds_deployed")]
    FundsDeployed,
    #[serde(rename = "emergency_response")]
    EmergencyResponse,
    #[serde(rename = "investment_return")]
    InvestmentReturn,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "lowercase")]
pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ImpactEventLocation {
    pub country: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub region: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub coordinates: Option<Coordinates>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Coordinates {
    pub lat: f64,
    pub lng: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BeneficiaryTestimonial {
    pub name: String,
    pub quote: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub photo: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ImpactEventMedia {
    #[serde(default)]
    pub photos: Vec<String>,
    #[serde(default)]
    pub videos: Vec<String>,
    #[serde(default)]
    pub testimonials: Vec<BeneficiaryTestimonial>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ImpactEventVerification {
    #[serde(rename = "verifiedBy")]
    pub verified_by: String,
    #[serde(rename = "verificationDate")]
    pub verification_date: String,
    #[serde(rename = "proofDocuments", default)]
    pub proof_documents: Vec<String>,
    pub status: VerificationStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ImpactEvent {
    pub id: String,
    #[serde(rename = "waqfId")]
    pub waqf_id: String,
    #[serde(rename = "waqfName")]
    pub waqf_name: String,
    #[serde(rename = "causeId")]
    pub cause_id: String,
    #[serde(rename = "causeName")]
    pub cause_name: String,
    pub timestamp: String,
    #[serde(rename = "type")]
    pub event_type: ImpactEventType,
    pub amount: f64,
    pub currency: String,
    #[serde(rename = "beneficiaryCount")]
    pub beneficiary_count: u32,
    #[serde(rename = "projectsCompleted", skip_serializing_if = "Option::is_none")]
    pub projects_completed: Option<u32>,
    pub location: ImpactEventLocation,
    pub media: ImpactEventMedia,
    pub verification: ImpactEventVerification,
    pub description: String,
    pub title: String,
    #[serde(rename = "createdBy")]
    pub created_by: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt", skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
    #[serde(rename = "isFeatured")]
    pub is_featured: bool,
}

// Validation functions
impl ImpactEvent {
    pub fn validate(&self) -> Result<(), String> {
        // Validate required fields
        if self.id.is_empty() {
            return Err("Impact event ID is required".to_string());
        }
        if self.waqf_id.is_empty() {
            return Err("Waqf ID is required".to_string());
        }
        if self.cause_id.is_empty() {
            return Err("Cause ID is required".to_string());
        }
        if self.title.len() < 5 {
            return Err("Title must be at least 5 characters".to_string());
        }
        if self.description.len() < 10 {
            return Err("Description must be at least 10 characters".to_string());
        }
        if self.amount < 0.0 {
            return Err("Amount must be non-negative".to_string());
        }
        if self.currency.len() != 3 {
            return Err("Currency must be a 3-letter code".to_string());
        }
        if self.location.country.is_empty() {
            return Err("Country is required".to_string());
        }

        Ok(())
    }
}

