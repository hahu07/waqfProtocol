use crate::waqf_types::{WaqfData, DonorProfile};
use serde::{Deserialize, Serialize};
use std::fmt;

// Production-grade validation constants for Waqfs
const MIN_NAME_LENGTH: usize = 2;
const MAX_NAME_LENGTH: usize = 100;
const MIN_DESCRIPTION_LENGTH: usize = 10;
const MAX_DESCRIPTION_LENGTH: usize = 2000;
const MIN_WAQF_ASSET: f64 = 100.0; // Minimum $100 for meaningful waqf contribution
const MAX_WAQF_ASSET: f64 = 1_000_000_000.0;

// Valid waqf statuses matching frontend
const VALID_WAQF_STATUSES: &[&str] = &["active", "paused", "completed", "inactive", "archived"];

// Valid reporting frequencies
const VALID_FREQUENCIES: &[&str] = &["quarterly", "semiannually", "yearly"];

// Valid report types
const VALID_REPORT_TYPES: &[&str] = &["financial", "impact"];

// Valid delivery methods
const VALID_DELIVERY_METHODS: &[&str] = &["email", "platform", "both"];

// Status transition matrix for waqfs - matches frontend
const VALID_WAQF_TRANSITIONS: &[(&str, &[&str])] = &[
    ("active", &["paused", "completed", "inactive", "archived"]),
    ("paused", &["active", "inactive", "archived"]),
    ("inactive", &["active", "archived"]),
    ("completed", &["archived"]), // Terminal state can only be archived
    ("archived", &[]), // Final terminal state
];

// Phone validation constants
const MIN_PHONE_LENGTH: usize = 10;
const MAX_PHONE_LENGTH: usize = 20;

// Address validation constants  
const MIN_ADDRESS_LENGTH: usize = 10;
const MAX_ADDRESS_LENGTH: usize = 200;

/// Comprehensive validation error types for WaqfData structure
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum WaqfValidationError {
    // Basic field validation
    IdEmpty,
    NameTooShort { min_length: usize, actual: usize },
    NameTooLong { max_length: usize, actual: usize },
    NameEmpty,
    NameContainsInvalidCharacters(String),
    
    DescriptionTooShort { min_length: usize, actual: usize },
    DescriptionTooLong { max_length: usize, actual: usize },
    DescriptionEmpty,
    DescriptionContainsInvalidCharacters(String),
    
    // Financial validation
    InitialCapitalTooLow { min_amount: f64, actual: f64 },
    InitialCapitalTooHigh { max_amount: f64, actual: f64 },
    InitialCapitalInvalid(String),
    
    // Donor validation
    DonorNameEmpty,
    DonorNameTooShort { min_length: usize, actual: usize },
    DonorEmailEmpty,
    DonorEmailInvalidFormat(String),
    DonorPhoneEmpty,
    DonorPhoneInvalidLength { min: usize, max: usize, actual: usize },
    DonorAddressEmpty,
    DonorAddressTooShort { min_length: usize, actual: usize },
    DonorAddressTooLong { max_length: usize, actual: usize },
    
    // Status and preferences validation
    InvalidStatus { status: String, valid_statuses: Vec<String> },
    InvalidStatusTransition { from: String, to: String },
    InvalidReportingFrequency { frequency: String, valid_frequencies: Vec<String> },
    InvalidReportType { report_type: String, valid_types: Vec<String> },
    InvalidDeliveryMethod { method: String, valid_methods: Vec<String> },
    
    // Causes validation
    NoCausesSelected,
    InvalidCauseId(String),
    
    // Financial metrics validation
    NegativeFinancialValue { field: String, value: f64 },
    InconsistentFinancialData(String),
    
    // Timestamp validation
    CreatedAtEmpty,
    InvalidTimestampFormat(String),
    
    // Business logic errors
    ArchivedWaqfModification,
    CompletedWaqfModification,
    CreatedByEmpty,
}

impl fmt::Display for WaqfValidationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            // Basic field validation
            Self::IdEmpty => write!(f, "Waqf ID cannot be empty"),
            Self::NameTooShort { min_length, actual } => {
                write!(f, "Name too short: minimum {} characters, got {}", min_length, actual)
            }
            Self::NameTooLong { max_length, actual } => {
                write!(f, "Name too long: maximum {} characters, got {}", max_length, actual)
            }
            Self::NameEmpty => write!(f, "Name cannot be empty"),
            Self::NameContainsInvalidCharacters(chars) => {
                write!(f, "Name contains invalid characters: {}", chars)
            }
            
            Self::DescriptionTooShort { min_length, actual } => {
                write!(f, "Description too short: minimum {} characters, got {}", min_length, actual)
            }
            Self::DescriptionTooLong { max_length, actual } => {
                write!(f, "Description too long: maximum {} characters, got {}", max_length, actual)
            }
            Self::DescriptionEmpty => write!(f, "Description cannot be empty"),
            Self::DescriptionContainsInvalidCharacters(chars) => {
                write!(f, "Description contains invalid characters: {}", chars)
            }
            
            // Financial validation
            Self::InitialCapitalTooLow { min_amount, actual } => {
                write!(f, "Initial capital too low: minimum {}, got {}", min_amount, actual)
            }
            Self::InitialCapitalTooHigh { max_amount, actual } => {
                write!(f, "Initial capital too high: maximum {}, got {}", max_amount, actual)
            }
            Self::InitialCapitalInvalid(reason) => {
                write!(f, "Invalid initial capital: {}", reason)
            }
            
            // Donor validation
            Self::DonorNameEmpty => write!(f, "Donor name cannot be empty"),
            Self::DonorNameTooShort { min_length, actual } => {
                write!(f, "Donor name too short: minimum {} characters, got {}", min_length, actual)
            }
            Self::DonorEmailEmpty => write!(f, "Donor email cannot be empty"),
            Self::DonorEmailInvalidFormat(email) => {
                write!(f, "Invalid donor email format: {}", email)
            }
            Self::DonorPhoneEmpty => write!(f, "Donor phone cannot be empty"),
            Self::DonorPhoneInvalidLength { min, max, actual } => {
                write!(f, "Donor phone invalid length: expected {}-{} characters, got {}", min, max, actual)
            }
            Self::DonorAddressEmpty => write!(f, "Donor address cannot be empty"),
            Self::DonorAddressTooShort { min_length, actual } => {
                write!(f, "Donor address too short: minimum {} characters, got {}", min_length, actual)
            }
            Self::DonorAddressTooLong { max_length, actual } => {
                write!(f, "Donor address too long: maximum {} characters, got {}", max_length, actual)
            }
            
            // Status and preferences
            Self::InvalidStatus { status, valid_statuses } => {
                write!(f, "Invalid status '{}'. Valid statuses: {}", status, valid_statuses.join(", "))
            }
            Self::InvalidStatusTransition { from, to } => {
                write!(f, "Invalid status transition from '{}' to '{}'", from, to)
            }
            Self::InvalidReportingFrequency { frequency, valid_frequencies } => {
                write!(f, "Invalid reporting frequency '{}'. Valid frequencies: {}", frequency, valid_frequencies.join(", "))
            }
            Self::InvalidReportType { report_type, valid_types } => {
                write!(f, "Invalid report type '{}'. Valid types: {}", report_type, valid_types.join(", "))
            }
            Self::InvalidDeliveryMethod { method, valid_methods } => {
                write!(f, "Invalid delivery method '{}'. Valid methods: {}", method, valid_methods.join(", "))
            }
            
            // Causes validation
            Self::NoCausesSelected => write!(f, "At least one cause must be selected"),
            Self::InvalidCauseId(cause_id) => write!(f, "Invalid cause ID: {}", cause_id),
            
            // Financial metrics validation
            Self::NegativeFinancialValue { field, value } => {
                write!(f, "Financial field '{}' cannot be negative: {}", field, value)
            }
            Self::InconsistentFinancialData(reason) => {
                write!(f, "Inconsistent financial data: {}", reason)
            }
            
            // Timestamp validation
            Self::CreatedAtEmpty => write!(f, "Created timestamp cannot be empty"),
            Self::InvalidTimestampFormat(timestamp) => {
                write!(f, "Invalid timestamp format: {}", timestamp)
            }
            
            // Business logic errors
            Self::ArchivedWaqfModification => {
                write!(f, "Cannot modify archived waqf")
            }
            Self::CompletedWaqfModification => {
                write!(f, "Cannot modify completed waqf")
            }
            Self::CreatedByEmpty => write!(f, "Created by field cannot be empty"),
        }
    }
}

/// Validation result with detailed error information
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WaqfValidationResult {
    pub is_valid: bool,
    pub errors: Vec<WaqfValidationError>,
    pub warnings: Vec<String>,
}

impl WaqfValidationResult {
    pub fn new() -> Self {
        Self {
            is_valid: true,
            errors: Vec::new(),
            warnings: Vec::new(),
        }
    }
    
    pub fn add_error(&mut self, error: WaqfValidationError) {
        self.is_valid = false;
        self.errors.push(error);
    }
    
    pub fn add_warning(&mut self, warning: String) {
        self.warnings.push(warning);
    }
}

/// Comprehensive waqf data validation with detailed error reporting
pub fn validate_waqf_data(data: &WaqfData) -> std::result::Result<(), String> {
    let validation_result = validate_waqf_data_detailed(data, None);
    
    if validation_result.is_valid {
        Ok(())
    } else {
        let error_messages: Vec<String> = validation_result.errors
            .iter()
            .map(|e| e.to_string())
            .collect();
        Err(error_messages.join("; "))
    }
}

/// Detailed validation with comprehensive error reporting for WaqfData
pub fn validate_waqf_data_detailed(
    data: &WaqfData, 
    current_data: Option<&WaqfData>
) -> WaqfValidationResult {
    let mut result = WaqfValidationResult::new();
    
    // Validate basic fields
    validate_waqf_id(&data.id, &mut result);
    validate_waqf_name(&data.name, &mut result);
    validate_waqf_description(&data.description, &mut result);
    validate_waqf_asset(data.waqf_asset, &mut result);
    
    // Validate donor profile
    validate_donor_profile(&data.donor, &mut result);
    
    // Validate causes
    validate_selected_causes(&data.selected_causes, &mut result);
    
    // Validate status
    validate_waqf_status(&data.status, &mut result);
    
    // Validate preferences
    validate_notification_preferences(&data.notifications, &mut result);
    validate_reporting_preferences(&data.reporting_preferences, &mut result);
    
    // Validate financial metrics
    validate_financial_metrics(&data.financial, &mut result);
    
    // Validate timestamps
    validate_waqf_timestamps(&data.created_at, data.updated_at.as_deref(), &mut result);
    
    // Validate creator
    validate_waqf_creator(&data.created_by, &mut result);
    
    // Status transition validation if updating
    if let Some(current) = current_data {
        validate_waqf_status_transition(&current.status, &data.status, &mut result);
        validate_waqf_update_permissions(current, data, &mut result);
    }
    
    // Business logic validations
    validate_waqf_business_rules(data, current_data, &mut result);
    
    result
}

/// Validate waqf ID field
fn validate_waqf_id(id: &str, result: &mut WaqfValidationResult) {
    if id.trim().is_empty() {
        result.add_error(WaqfValidationError::IdEmpty);
    }
}

/// Validate waqf name field
fn validate_waqf_name(name: &str, result: &mut WaqfValidationResult) {
    let trimmed = name.trim();
    
    if trimmed.is_empty() {
        result.add_error(WaqfValidationError::NameEmpty);
        return;
    }
    
    if trimmed.len() < MIN_NAME_LENGTH {
        result.add_error(WaqfValidationError::NameTooShort {
            min_length: MIN_NAME_LENGTH,
            actual: trimmed.len(),
        });
    }
    
    if trimmed.len() > MAX_NAME_LENGTH {
        result.add_error(WaqfValidationError::NameTooLong {
            max_length: MAX_NAME_LENGTH,
            actual: trimmed.len(),
        });
    }
    
    // Check for invalid characters
    let invalid_chars: Vec<char> = trimmed.chars()
        .filter(|&c| !is_valid_text_character(c))
        .collect();
    
    if !invalid_chars.is_empty() {
        let invalid_str: String = invalid_chars.into_iter().collect();
        result.add_error(WaqfValidationError::NameContainsInvalidCharacters(invalid_str));
    }
}

/// Validate waqf description field
fn validate_waqf_description(description: &str, result: &mut WaqfValidationResult) {
    let trimmed = description.trim();
    
    if trimmed.is_empty() {
        result.add_error(WaqfValidationError::DescriptionEmpty);
        return;
    }
    
    if trimmed.len() < MIN_DESCRIPTION_LENGTH {
        result.add_error(WaqfValidationError::DescriptionTooShort {
            min_length: MIN_DESCRIPTION_LENGTH,
            actual: trimmed.len(),
        });
    }
    
    if trimmed.len() > MAX_DESCRIPTION_LENGTH {
        result.add_error(WaqfValidationError::DescriptionTooLong {
            max_length: MAX_DESCRIPTION_LENGTH,
            actual: trimmed.len(),
        });
    }
}

/// Validate donor profile
fn validate_donor_profile(donor: &DonorProfile, result: &mut WaqfValidationResult) {
    // Validate donor name
    if donor.name.trim().is_empty() {
        result.add_error(WaqfValidationError::DonorNameEmpty);
    } else if donor.name.trim().len() < MIN_NAME_LENGTH {
        result.add_error(WaqfValidationError::DonorNameTooShort {
            min_length: MIN_NAME_LENGTH,
            actual: donor.name.trim().len(),
        });
    }
    
    // Validate donor email
    if donor.email.trim().is_empty() {
        result.add_error(WaqfValidationError::DonorEmailEmpty);
    } else if !is_valid_email(&donor.email) {
        result.add_error(WaqfValidationError::DonorEmailInvalidFormat(donor.email.clone()));
    }
    
    // Validate donor phone
    if donor.phone.trim().is_empty() {
        result.add_error(WaqfValidationError::DonorPhoneEmpty);
    } else {
        let phone_len = donor.phone.trim().len();
        if phone_len < MIN_PHONE_LENGTH || phone_len > MAX_PHONE_LENGTH {
            result.add_error(WaqfValidationError::DonorPhoneInvalidLength {
                min: MIN_PHONE_LENGTH,
                max: MAX_PHONE_LENGTH,
                actual: phone_len,
            });
        }
    }
    
    // Validate donor address
    if donor.address.trim().is_empty() {
        result.add_error(WaqfValidationError::DonorAddressEmpty);
    } else {
        let addr_len = donor.address.trim().len();
        if addr_len < MIN_ADDRESS_LENGTH {
            result.add_error(WaqfValidationError::DonorAddressTooShort {
                min_length: MIN_ADDRESS_LENGTH,
                actual: addr_len,
            });
        } else if addr_len > MAX_ADDRESS_LENGTH {
            result.add_error(WaqfValidationError::DonorAddressTooLong {
                max_length: MAX_ADDRESS_LENGTH,
                actual: addr_len,
            });
        }
    }
}

/// Validate selected causes
fn validate_selected_causes(causes: &[String], result: &mut WaqfValidationResult) {
    if causes.is_empty() {
        result.add_error(WaqfValidationError::NoCausesSelected);
    }
    
    for cause_id in causes {
        if cause_id.trim().is_empty() {
            result.add_error(WaqfValidationError::InvalidCauseId(cause_id.clone()));
        }
    }
}

/// Validate waqf status
fn validate_waqf_status(status: &str, result: &mut WaqfValidationResult) {
    if !VALID_WAQF_STATUSES.contains(&status) {
        result.add_error(WaqfValidationError::InvalidStatus {
            status: status.to_string(),
            valid_statuses: VALID_WAQF_STATUSES.iter().map(|s| s.to_string()).collect(),
        });
    }
}

/// Validate notification preferences
fn validate_notification_preferences(_notifications: &crate::waqf_types::NotificationPreferences, _result: &mut WaqfValidationResult) {
    // Basic validation - boolean fields are always valid
    // Could add business logic here if needed
}

/// Validate reporting preferences
fn validate_reporting_preferences(prefs: &crate::waqf_types::ReportingPreferences, result: &mut WaqfValidationResult) {
    // Validate frequency
    if !VALID_FREQUENCIES.contains(&prefs.frequency.as_str()) {
        result.add_error(WaqfValidationError::InvalidReportingFrequency {
            frequency: prefs.frequency.clone(),
            valid_frequencies: VALID_FREQUENCIES.iter().map(|s| s.to_string()).collect(),
        });
    }
    
    // Validate report types
    for report_type in &prefs.report_types {
        if !VALID_REPORT_TYPES.contains(&report_type.as_str()) {
            result.add_error(WaqfValidationError::InvalidReportType {
                report_type: report_type.clone(),
                valid_types: VALID_REPORT_TYPES.iter().map(|s| s.to_string()).collect(),
            });
        }
    }
    
    // Validate delivery method
    if !VALID_DELIVERY_METHODS.contains(&prefs.delivery_method.as_str()) {
        result.add_error(WaqfValidationError::InvalidDeliveryMethod {
            method: prefs.delivery_method.clone(),
            valid_methods: VALID_DELIVERY_METHODS.iter().map(|s| s.to_string()).collect(),
        });
    }
}

/// Validate financial metrics
fn validate_financial_metrics(financial: &crate::waqf_types::FinancialMetrics, result: &mut WaqfValidationResult) {
    // Check for negative values
    if financial.total_donations < 0.0 {
        result.add_error(WaqfValidationError::NegativeFinancialValue {
            field: "total_donations".to_string(),
            value: financial.total_donations,
        });
    }
    
    if financial.total_distributed < 0.0 {
        result.add_error(WaqfValidationError::NegativeFinancialValue {
            field: "total_distributed".to_string(),
            value: financial.total_distributed,
        });
    }
    
    if financial.current_balance < 0.0 {
        result.add_error(WaqfValidationError::NegativeFinancialValue {
            field: "current_balance".to_string(),
            value: financial.current_balance,
        });
    }
    
    // Basic consistency check
    let expected_balance = financial.total_donations - financial.total_distributed + financial.total_investment_return;
    if (expected_balance - financial.current_balance).abs() > 0.01 {
        result.add_error(WaqfValidationError::InconsistentFinancialData(
            "Current balance doesn't match calculated balance".to_string()
        ));
    }
}

/// Validate waqf timestamps
fn validate_waqf_timestamps(created_at: &str, updated_at: Option<&str>, result: &mut WaqfValidationResult) {
    if created_at.trim().is_empty() {
        result.add_error(WaqfValidationError::CreatedAtEmpty);
    }
    
    // Basic ISO timestamp format validation would go here
    // For now, just check they're not empty
    if let Some(updated) = updated_at {
        if updated.trim().is_empty() {
            result.add_error(WaqfValidationError::InvalidTimestampFormat("Updated timestamp is empty".to_string()));
        }
    }
}

/// Validate waqf creator
fn validate_waqf_creator(created_by: &str, result: &mut WaqfValidationResult) {
    if created_by.trim().is_empty() {
        result.add_error(WaqfValidationError::CreatedByEmpty);
    }
}

/// Validate waqf status transition
fn validate_waqf_status_transition(from: &str, to: &str, result: &mut WaqfValidationResult) {
    if from == to {
        return; // No transition needed
    }
    
    let allowed_transitions = VALID_WAQF_TRANSITIONS
        .iter()
        .find(|(status, _)| *status == from)
        .map(|(_, transitions)| *transitions)
        .unwrap_or(&[]);
    
    if !allowed_transitions.contains(&to) {
        result.add_error(WaqfValidationError::InvalidStatusTransition {
            from: from.to_string(),
            to: to.to_string(),
        });
    }
}

/// Validate waqf update permissions
fn validate_waqf_update_permissions(current: &WaqfData, new: &WaqfData, result: &mut WaqfValidationResult) {
    // Check if trying to modify archived waqf
    if current.status == "archived" {
        result.add_error(WaqfValidationError::ArchivedWaqfModification);
        return;
    }
    
    // Check if trying to modify completed waqf inappropriately
    // Allow financial updates (adding funds) to completed waqfs
    if current.status == "completed" && new.status != "archived" {
        // Check if only financial fields are changing (donations, balance)
        let is_financial_only_update = 
            current.name == new.name &&
            current.description == new.description &&
            current.waqf_asset == new.waqf_asset &&
            current.donor == new.donor &&
            current.selected_causes == new.selected_causes;
        
        // If non-financial fields are being modified, block the update
        if !is_financial_only_update {
            result.add_error(WaqfValidationError::CompletedWaqfModification);
        }
    }
}

/// Validate waqf business rules
fn validate_waqf_business_rules(data: &WaqfData, current_data: Option<&WaqfData>, result: &mut WaqfValidationResult) {
    // Initial capital validation
    if data.status == "active" && data.waqf_asset < 1.0 {
        result.add_warning("Active waqf with very low initial capital".to_string());
    }
    
    // Warn about changes to active waqfs
    if let Some(current) = current_data {
        if current.status == "active" {
            if current.name != data.name {
                result.add_warning("Changing name of active waqf requires additional approval".to_string());
            }
            
            if (current.waqf_asset - data.waqf_asset).abs() > f64::EPSILON {
                result.add_warning("Changing initial capital of active waqf requires financial audit".to_string());
            }
        }
    }
}

/// Helper function to validate email format
fn is_valid_email(email: &str) -> bool {
    // Simple email validation - in production you'd use a proper regex crate
    email.contains('@') && email.contains('.') && email.len() > 5
}
/// Validate initial capital amount
fn validate_waqf_asset(amount: f64, result: &mut WaqfValidationResult) {
    // Check for NaN and infinity
    if amount.is_nan() {
        result.add_error(WaqfValidationError::InitialCapitalInvalid(
            "Amount cannot be NaN".to_string()
        ));
        return;
    }
    
    if amount.is_infinite() {
        result.add_error(WaqfValidationError::InitialCapitalInvalid(
            "Amount cannot be infinite".to_string()
        ));
        return;
    }
    
    // Check range
    if amount < MIN_WAQF_ASSET {
        result.add_error(WaqfValidationError::InitialCapitalTooLow {
            min_amount: MIN_WAQF_ASSET,
            actual: amount,
        });
    }
    
    if amount > MAX_WAQF_ASSET {
        result.add_error(WaqfValidationError::InitialCapitalTooHigh {
            max_amount: MAX_WAQF_ASSET,
            actual: amount,
        });
    }
    
    // Check for excessive precision (more than 2 decimal places)
    let rounded = (amount * 100.0).round() / 100.0;
    if (amount - rounded).abs() > f64::EPSILON {
        result.add_warning("Initial capital has more than 2 decimal places - will be rounded".to_string());
    }
}

/// Check if character is valid for text fields
fn is_valid_text_character(c: char) -> bool {
    c.is_alphanumeric() || 
    c.is_whitespace() || 
    ".,!?;:()[]{}\"'-_/\\@#$%&*+=<>|~`^°§".contains(c)
}



