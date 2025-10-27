use junobuild_macros::{
    assert_delete_doc, assert_set_doc, on_set_doc,
};
use junobuild_satellite::{
    include_satellite, AssertDeleteDocContext, AssertSetDocContext, OnSetDocContext,
};

mod admin_hooks;
mod cause_hooks;
mod category_hooks;
mod admin_request_hooks;
mod activity_log_hooks;
mod donation_hooks;
mod allocation_hooks;
pub mod waqf_types;
pub mod waqf_hooks;

mod waqf_utils;

// Import all validation hooks
use crate::admin_hooks::{
    assert_admin_operations,
    assert_admin_deletion,
    handle_admin_changes,
};

use crate::cause_hooks::{
    assert_cause_operations,
    assert_cause_deletion,
    handle_cause_changes,
};

use crate::admin_request_hooks::{
    assert_admin_request_operations,
    assert_admin_request_deletion,
    handle_admin_request_changes,
};

use crate::activity_log_hooks::{
    assert_activity_log_operations,
    assert_activity_log_deletion,
    handle_activity_log_changes,
};

use crate::waqf_hooks::{
    assert_waqf_operations,
    assert_waqf_deletion,
    handle_waqf_changes,
};

use crate::donation_hooks::{
    assert_donation_operations,
    assert_donation_deletion,
    handle_donation_changes,
};

use crate::allocation_hooks::{
    assert_allocation_operations,
    assert_allocation_deletion,
    handle_allocation_changes,
};

use crate::category_hooks::{
    assert_category_operations,
    assert_category_deletion,
    handle_category_changes,
    assert_subcategory_operations,
    assert_subcategory_deletion,
    handle_subcategory_changes,
};

// Main on_set_doc handler
#[on_set_doc(collections = ["admins", "causes", "categories", "subcategories", "admin_requests", "activity_logs", "waqfs", "donations", "allocations"])]
fn on_set_doc(context: OnSetDocContext) -> std::result::Result<(), String> {
    // Route to appropriate change handler based on collection
    match context.data.collection.as_str() {
        "admins" => {
            handle_admin_changes(context)?
        },
        "causes" => {
            handle_cause_changes(context)?
        },
        "categories" => {
            handle_category_changes(context)?
        },
        "subcategories" => {
            handle_subcategory_changes(context)?
        },
        "admin_requests" => {
            handle_admin_request_changes(context)?
        },
        "activity_logs" => {
            handle_activity_log_changes(context)?
        },
        "waqfs" => {
            handle_waqf_changes(context)?
        },
        "donations" => {
            handle_donation_changes(context)?
        },
        "allocations" => {
            handle_allocation_changes(context)?
        },
        _ => {
            // Log unknown collection access
            ic_cdk::println!("Document change in unhandled collection: {}", context.data.collection);
        }
    }
    
    Ok(())
}

#[assert_set_doc(collections = ["admins", "causes", "categories", "subcategories", "admin_requests", "activity_logs", "waqfs", "donations", "allocations"])]
fn assert_set_doc(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Route to appropriate assertion handler based on collection
    match context.data.collection.as_str() {
        "admins" => {
            assert_admin_operations(context)
        },
        "causes" => {
            assert_cause_operations(context)
        },
        "categories" => {
            assert_category_operations(context)
        },
        "subcategories" => {
            assert_subcategory_operations(context)
        },
        "admin_requests" => {
            assert_admin_request_operations(context)
        },
        "activity_logs" => {
            assert_activity_log_operations(context)
        },
        "waqfs" => {
            assert_waqf_operations(context)
        },
        "donations" => {
            assert_donation_operations(context)
        },
        "allocations" => {
            assert_allocation_operations(context)
        },
        _ => {
            // Log unknown collection validation attempt
            ic_cdk::println!("Validation attempt on unhandled collection: {}", context.data.collection);
            Ok(())
        }
    }
}

#[assert_delete_doc(collections = ["admins", "causes", "categories", "subcategories", "admin_requests", "activity_logs", "waqfs", "donations", "allocations"])]
fn assert_delete_doc(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Route to appropriate deletion assertion handler based on collection
    match context.data.collection.as_str() {
        "admins" => {
            assert_admin_deletion(context)
        },
        "causes" => {
            assert_cause_deletion(context)
        },
        "categories" => {
            assert_category_deletion(context)
        },
        "subcategories" => {
            assert_subcategory_deletion(context)
        },
        "admin_requests" => {
            assert_admin_request_deletion(context)
        },
        "activity_logs" => {
            assert_activity_log_deletion(context)
        },
        "waqfs" => {
            assert_waqf_deletion(context)
        },
        "donations" => {
            assert_donation_deletion(context)
        },
        "allocations" => {
            assert_allocation_deletion(context)
        },
        _ => {
            // Log unknown collection deletion attempt
            ic_cdk::println!("Deletion attempt on unhandled collection: {}", context.data.collection);
            Ok(())
        }
    }
}

include_satellite!();