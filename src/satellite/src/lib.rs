use junobuild_macros::{
    assert_delete_doc, assert_set_doc, on_delete_asset,
    on_delete_doc, on_delete_filtered_assets, on_delete_filtered_docs,
    on_delete_many_assets, on_delete_many_docs, on_set_doc, on_set_many_docs, on_upload_asset
};
use junobuild_satellite::{
    include_satellite, AssertDeleteDocContext, AssertSetDocContext, OnDeleteAssetContext,
    OnDeleteDocContext, OnDeleteFilteredAssetsContext, OnDeleteFilteredDocsContext,
    OnDeleteManyAssetsContext, OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext
};

mod admin_hooks;
mod cause_hooks;
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

// Main on_set_doc handler
#[on_set_doc(collections = ["admins", "causes", "admin_requests", "activity_logs", "waqfs", "donations", "allocations"])]
fn on_set_doc(context: OnSetDocContext) -> std::result::Result<(), String> {
    // Route to appropriate change handler based on collection
    match context.data.collection.as_str() {
        "admins" => {
            handle_admin_changes(context)?
        },
        "causes" => {
            handle_cause_changes(context)?
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

#[assert_set_doc(collections = ["admins", "causes", "admin_requests", "activity_logs", "waqfs", "donations", "allocations"])]
fn assert_set_doc(context: AssertSetDocContext) -> std::result::Result<(), String> {
    // Route to appropriate assertion handler based on collection
    match context.data.collection.as_str() {
        "admins" => {
            assert_admin_operations(context)
        },
        "causes" => {
            assert_cause_operations(context)
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

#[assert_delete_doc(collections = ["admins", "causes", "admin_requests", "activity_logs", "waqfs", "donations", "allocations"])]
fn assert_delete_doc(context: AssertDeleteDocContext) -> std::result::Result<(), String> {
    // Route to appropriate deletion assertion handler based on collection
    match context.data.collection.as_str() {
        "admins" => {
            assert_admin_deletion(context)
        },
        "causes" => {
            assert_cause_deletion(context)
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

// Default implementations for other hooks
#[on_set_many_docs]
fn on_set_many_docs(_context: OnSetManyDocsContext) -> std::result::Result<(), String> {
    Ok(())
}

#[on_delete_asset]
fn on_delete_asset(_context: OnDeleteAssetContext) -> std::result::Result<(), String> {
    Ok(())
}

#[on_delete_doc]
fn on_delete_doc(_context: OnDeleteDocContext) -> std::result::Result<(), String> {
    Ok(())
}

#[on_delete_filtered_assets]
fn on_delete_filtered_assets(_context: OnDeleteFilteredAssetsContext) -> std::result::Result<(), String> {
    Ok(())
}

#[on_delete_filtered_docs]
fn on_delete_filtered_docs(_context: OnDeleteFilteredDocsContext) -> std::result::Result<(), String> {
    Ok(())
}

#[on_delete_many_assets]
fn on_delete_many_assets(_context: OnDeleteManyAssetsContext) -> std::result::Result<(), String> {
    Ok(())
}

#[on_delete_many_docs]
fn on_delete_many_docs(_context: OnDeleteManyDocsContext) -> std::result::Result<(), String> {
    Ok(())
}

#[on_upload_asset]
fn on_upload_asset(_context: OnUploadAssetContext) -> std::result::Result<(), String> {
    Ok(())
}

include_satellite!();
