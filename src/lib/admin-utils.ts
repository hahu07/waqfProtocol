// src/lib/admin-utils.ts
import { listDocs, getDoc, setDoc, deleteDoc, type Doc } from '@junobuild/core';
import { logActivity } from './activity-utils';

// Digital platform permissions with Islamic governance inspiration
type AdminPermission = 
  | 'waqf_management'      // Manage Waqf endowments and allocations
  | 'cause_management'     // Create and edit charitable causes (but not approve)
  | 'cause_approval'       // Approve/reject charitable causes (higher privilege)
  | 'user_support'         // Handle user inquiries and basic support
  | 'financial_oversight'  // Access financial reports and donation tracking
  | 'content_moderation'   // Moderate platform content and communications
  | 'system_administration' // Platform settings and technical configuration
  | 'audit_compliance'     // Full audit access and compliance monitoring
  | 'admin_request_creation' // Create requests to add/remove admins (requires approval)
  | 'admin_request_approval' // Approve/reject admin add/remove requests
  | 'platform_governance'; // Supreme administrative authority

// Digital platform roles with Islamic-inspired naming
type AdminRole = 
  | 'support_agent'    // Customer support and basic user assistance
  | 'content_moderator' // Content review and community management
  | 'waqf_manager'     // Waqf endowment and cause management
  | 'finance_officer'  // Financial oversight and reporting
  | 'compliance_officer' // Audit and regulatory compliance
  | 'platform_admin';   // Full platform administration

interface AdminUser {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: number;
  createdBy: string;
  permissions: AdminPermission[];
  updatedAt?: number;
  updatedBy?: string;
  lastActive?: number;
  deleted?: boolean;
  deletedAt?: number;
  deletedBy?: string;
}

interface AdminDoc extends Doc<AdminUser> {
  hooks?: {
    assert?: string[];
    post?: string[];
  };
}

// Admin request types for two-stage approval workflow
type AdminRequestType = 'add' | 'remove';
type AdminRequestStatus = 'pending' | 'approved' | 'rejected';

interface AdminRequest {
  requestId: string;
  type: AdminRequestType;
  status: AdminRequestStatus;
  requestedBy: string; // Compliance Officer who created the request
  requestedAt: number;
  targetUserId: string; // User to be added/removed as admin
  targetUserEmail?: string;
  targetUserName?: string;
  targetRole?: AdminRole; // For add requests
  targetPermissions?: AdminPermission[]; // For add requests
  reason: string; // Justification for the request
  reviewedBy?: string; // Platform Admin who approved/rejected
  reviewedAt?: number;
  reviewNotes?: string; // Platform Admin's notes
}

interface AdminRequestDoc extends Doc<AdminRequest> {
  hooks?: {
    assert?: string[];
    post?: string[];
  };
}

const ADMIN_COLLECTION = 'admins';
const ADMIN_REQUEST_COLLECTION = 'admin_requests';
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  support_agent: ['user_support'], // Only customer support
  content_moderator: ['content_moderation', 'user_support'], // Only content moderation
  waqf_manager: ['waqf_management', 'cause_management'], // Only waqf and cause creation/editing
  finance_officer: ['financial_oversight', 'audit_compliance'], // Only financial oversight
  compliance_officer: ['audit_compliance', 'financial_oversight', 'cause_approval', 'admin_request_creation'], // Can approve causes + request admin changes
  platform_admin: ['platform_governance', 'system_administration', 'audit_compliance', 'financial_oversight', 'waqf_management', 'cause_management', 'cause_approval', 'content_moderation', 'user_support', 'admin_request_creation', 'admin_request_approval'] // Full access
};

const validateAdminUser = (data: Partial<AdminUser>): data is AdminUser => {
  const validPermissions = [
    'waqf_management', 'cause_management', 'cause_approval', 'user_support', 'financial_oversight',
    'content_moderation', 'system_administration', 'audit_compliance', 'admin_request_creation', 'admin_request_approval', 'platform_governance'
  ];
  
  return (
    !!data.userId &&
    !!data.email &&
    !!data.name &&
    !!data.role &&
    !!data.createdAt &&
    !!data.createdBy &&
    Array.isArray(data.permissions) &&
    data.permissions.every(permission => validPermissions.includes(permission))
  );
};

const validateRolePermissions = (user: AdminUser) => {
  const allowedPermissions = ROLE_PERMISSIONS[user.role];
  return user.permissions.every(perm => allowedPermissions.includes(perm));
};


// Admin request workflow functions
const createAdminRequest = async (
  requestedBy: string,
  type: AdminRequestType,
  targetUserId: string,
  reason: string,
  targetUserEmail?: string,
  targetUserName?: string,
  targetRole?: AdminRole,
  targetPermissions?: AdminPermission[]
): Promise<string> => {
  // Check if user has admin request creation permission
  if (!await hasPermission(requestedBy, 'admin_request_creation')) {
    throw new Error('Permission denied: Only Compliance Officers can create admin requests');
  }

  const requestId = `admin_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const requestData: AdminRequest = {
    requestId,
    type,
    status: 'pending',
    requestedBy,
    requestedAt: Date.now(),
    targetUserId,
    targetUserEmail,
    targetUserName,
    targetRole,
    targetPermissions: targetPermissions ?? (targetRole ? ROLE_PERMISSIONS[targetRole] : undefined),
    reason
  };

  try {
    await setDoc<AdminRequest>({
      collection: ADMIN_REQUEST_COLLECTION,
      doc: {
        key: requestId,
        data: requestData
      }
    });
    
    // Log the activity
    await logActivity(
      'admin_request_created',
      requestedBy,
      'Compliance Officer',
      {
        targetId: targetUserId,
        targetName: targetUserName || targetUserId,
        status: type
      }
    );
    
    return requestId;
  } catch (error) {
    console.error('Failed to create admin request:', error);
    throw new Error(`Failed to create admin request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const listAdminRequests = async (status?: AdminRequestStatus): Promise<AdminRequestDoc[]> => {
  try {
    const { items } = await listDocs<AdminRequest>({
      collection: ADMIN_REQUEST_COLLECTION
    });
    
    if (status) {
      return items.filter(item => item.data.status === status);
    }
    
    return items;
  } catch (error) {
    console.error('Failed to list admin requests:', error);
    return [];
  }
};

const approveAdminRequest = async (
  requestId: string,
  reviewedBy: string,
  reviewNotes?: string
): Promise<void> => {
  // Check if user has admin request approval permission
  if (!await hasPermission(reviewedBy, 'admin_request_approval')) {
    throw new Error('Permission denied: Only Platform Admins can approve admin requests');
  }

  try {
    const request = await getDoc<AdminRequest>({
      collection: ADMIN_REQUEST_COLLECTION,
      key: requestId
    });

    if (!request) {
      throw new Error('Admin request not found');
    }

    if (request.data.status !== 'pending') {
      throw new Error('Admin request has already been reviewed');
    }

    // Execute the admin action FIRST (before updating request status)
    console.log('🔧 Executing admin action for request:', request.data.type, 'for user:', request.data.targetUserId);
    if (request.data.type === 'add') {
      console.log('➕ Adding admin with role:', request.data.targetRole, 'permissions:', request.data.targetPermissions);
      await addAdminDirectly(
        request.data.targetUserId,
        reviewedBy,
        request.data.targetRole || 'support_agent',
        request.data.targetUserEmail || '',
        request.data.targetUserName || '',
        request.data.targetPermissions
      );
      console.log('✅ Admin added successfully');
    } else if (request.data.type === 'remove') {
      console.log('➖ Removing admin');
      await removeAdminDirectly(request.data.targetUserId, reviewedBy);
      console.log('✅ Admin removed successfully');
    }
    
    // Update request status AFTER successful admin action
    const updatedRequestData: AdminRequest = {
      ...request.data,
      status: 'approved',
      reviewedBy,
      reviewedAt: Date.now(),
      reviewNotes
    };

    await setDoc<AdminRequest>({
      collection: ADMIN_REQUEST_COLLECTION,
      doc: {
        key: requestId,
        data: updatedRequestData,
        version: request.version
      }
    });
    
    // Log the activity
    await logActivity(
      'admin_request_approved',
      reviewedBy,
      'Platform Admin',
      {
        targetId: request.data.targetUserId,
        targetName: request.data.targetUserName || request.data.targetUserId,
        status: request.data.type
      }
    );
  } catch (error) {
    console.error('Failed to approve admin request:', error);
    throw new Error(`Failed to approve admin request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const rejectAdminRequest = async (
  requestId: string,
  reviewedBy: string,
  reviewNotes: string
): Promise<void> => {
  // Check if user has admin request approval permission
  if (!await hasPermission(reviewedBy, 'admin_request_approval')) {
    throw new Error('Permission denied: Only Platform Admins can reject admin requests');
  }

  try {
    const request = await getDoc<AdminRequest>({
      collection: ADMIN_REQUEST_COLLECTION,
      key: requestId
    });

    if (!request) {
      throw new Error('Admin request not found');
    }

    if (request.data.status !== 'pending') {
      throw new Error('Admin request has already been reviewed');
    }

    // Update request status
    const updatedRequestData: AdminRequest = {
      ...request.data,
      status: 'rejected',
      reviewedBy,
      reviewedAt: Date.now(),
      reviewNotes
    };

    await setDoc<AdminRequest>({
      collection: ADMIN_REQUEST_COLLECTION,
      doc: {
        key: requestId,
        data: updatedRequestData,
        version: request.version
      }
    });
    
    // Log the activity
    await logActivity(
      'admin_request_rejected',
      reviewedBy,
      'Platform Admin',
      {
        targetId: request.data.targetUserId,
        targetName: request.data.targetUserName || request.data.targetUserId,
        status: request.data.type
      }
    );
  } catch (error) {
    console.error('Failed to reject admin request:', error);
    throw new Error(`Failed to reject admin request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Permission check functions for admin requests
const canCreateAdminRequests = async (userId: string): Promise<boolean> => {
  return await hasPermission(userId, 'admin_request_creation');
};

const canApproveAdminRequests = async (userId: string): Promise<boolean> => {
  return await hasPermission(userId, 'admin_request_approval');
};

const isAdmin = async (userId: string): Promise<boolean> => {
  // Development override - always grant admin access in dev mode
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const admin = await getDoc<AdminUser>({
      collection: ADMIN_COLLECTION,
      key: userId
    });
    return !!admin;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
};

const hasPermission = async (
  userId: string,
  permission: AdminPermission
): Promise<boolean> => {
  // Development override for testing different roles
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const devRoleOverride = localStorage.getItem('dev-role-override') as AdminRole;
    if (devRoleOverride && ROLE_PERMISSIONS[devRoleOverride]) {
      return ROLE_PERMISSIONS[devRoleOverride].includes(permission);
    }
  }

  try {
    const admin = await getDoc<AdminUser>({
      collection: ADMIN_COLLECTION,
      key: userId
    });
    return admin?.data?.permissions?.includes(permission) || false;
  } catch (error) {
    console.error('Failed to check permissions:', error);
    return false;
  }
};

// Specific function for checking cause approval permission
const canApproveCauses = async (userId: string): Promise<boolean> => {
  return await hasPermission(userId, 'cause_approval');
};

// Specific function for checking cause management permission (create/edit)
const canManageCauses = async (userId: string): Promise<boolean> => {
  return await hasPermission(userId, 'cause_management');
};

// Function to get admin user data
const getAdminUser = async (userId: string): Promise<AdminUser | null> => {
  try {
    const admin = await getDoc<AdminUser>({
      collection: ADMIN_COLLECTION,
      key: userId
    });
    return admin?.data || null;
  } catch (error) {
    console.error('Failed to get admin user:', error);
    return null;
  }
};

const addAdminDirectly = async (
  userId: string,
  currentUserId: string,
  role: AdminRole = 'support_agent',
  email: string = '',
  name: string = '',
  permissions?: AdminPermission[]
): Promise<void> => {
  console.log('💾 Starting addAdminDirectly for:', { userId, role, email, name, permissions });
  
  const finalPermissions = permissions ?? ROLE_PERMISSIONS[role];
  console.log('🔑 Final permissions:', finalPermissions);
  
  // Structure data to match Rust backend expectations
  const adminData = {
    email: email || `${userId}@example.com`, // Ensure email is not empty
    role,
    permissions: finalPermissions,
    created_by: currentUserId, // Snake case for Rust compatibility
    active: true, // Required by Rust backend
    // Additional frontend fields
    userId,
    name: name || `User ${userId}`,
    createdAt: Date.now(),
    lastActive: Date.now()
  };
  
  console.log('📋 Admin data to save:', adminData);
  
  // Skip validation for now during testing
  // if (!validateAdminUser(adminData)) {
  //   throw new Error('Invalid admin data: validation failed');
  // }
  
  try {
    // First check if admin already exists
    console.log('🔍 Checking if admin already exists:', userId);
    const existing = await getDoc({
      collection: ADMIN_COLLECTION,
      key: userId
    }).catch(() => null); // Ignore errors if document doesn't exist
    
    if (existing) {
      console.log('⚠️  Admin already exists:', existing.data);
      throw new Error(`Admin with userId ${userId} already exists`);
    }
    
    console.log('📤 Saving new admin to collection:', ADMIN_COLLECTION);
    console.log('🏗️  Document structure:');
    console.log('   - Key:', userId);
    console.log('   - Data keys:', Object.keys(adminData));
    console.log('   - Full data:', JSON.stringify(adminData, null, 2));
    
    await setDoc({
      collection: ADMIN_COLLECTION,
      doc: {
        key: userId,
        data: adminData
      }
    });
    console.log('✅ Successfully saved admin document to Juno');
    
    // Log the activity - temporarily disabled for testing
    // await logActivity(
    //   'admin_added',
    //   currentUserId,
    //   'Admin',
    //   {
    //     targetId: userId,
    //     targetName: name || userId,
    //     status: role
    //   }
    // );
    console.log('📋 Skipping activity log for testing');
  } catch (error) {
    console.error('❌ ERROR in addAdminDirectly:');
    console.error('   - Error type:', error?.constructor?.name);
    console.error('   - Error message:', (error as any)?.message);
    console.error('   - Error code:', (error as any)?.code);
    console.error('   - Full error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Only super admins')) {
        throw new Error('Permission denied: Requires super admin privileges');
      }
      if (error.message.includes('juno.error.no_version_provided')) {
        console.error('🔍 Version error detected - this might be an update vs create issue');
        throw new Error('Version error: This might be a document update conflict. The admin might already exist.');
      }
      if (error.message.includes('already exists')) {
        throw error; // Pass through our custom existence check error
      }
    }
    
    throw new Error(`Failed to create admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const removeAdminDirectly = async (
  userId: string,
  currentUserId: string
): Promise<void> => {
  console.log('🗑️  Starting removeAdminDirectly for:', { userId, currentUserId });
  
  if (!userId || !currentUserId) {
    throw new Error('Missing required fields: userId and currentUserId');
  }

  try {
    // First, get the document to retrieve its version
    console.log('🔍 Looking up existing admin:', userId);
    const existing = await getDoc<AdminUser>({
      collection: ADMIN_COLLECTION,
      key: userId
    });

    if (!existing) {
      console.log('❌ Admin not found:', userId);
      throw new Error(`Admin not found: ${userId}`);
    }
    
    console.log('✅ Found existing admin:', {
      key: existing.key,
      version: existing.version,
      data: existing.data
    });

    // Delete the document with proper version
    console.log('🗑️  Deleting admin document with version:', existing.version);
    await deleteDoc({
      collection: ADMIN_COLLECTION,
      doc: existing
    });
    console.log('✅ Successfully deleted admin document');
    
    // Log the activity - temporarily disabled for testing
    console.log('📋 Skipping activity log for testing');
    // await logActivity(
    //   'admin_removed',
    //   currentUserId,
    //   'Admin',
    //   {
    //     targetId: userId,
    //     targetName: existing.data.name || userId
    //   }
    // );
  } catch (error) {
    console.error('❌ ERROR in removeAdminDirectly:');
    console.error('   - User ID:', userId);
    console.error('   - Error type:', error?.constructor?.name);
    console.error('   - Error message:', (error as any)?.message);
    console.error('   - Error code:', (error as any)?.code);
    console.error('   - Full error:', error);
    
    throw new Error(`Admin removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const updateAdmin = async (
  userId: string,
  currentUserId: string,
  role?: AdminRole,
  permissions?: AdminPermission[],
  email?: string,
  name?: string
): Promise<void> => {
  if (!userId || !currentUserId) {
    throw new Error('Missing required fields');
  }

  try {
    const existing = await getDoc<AdminUser>({
      collection: ADMIN_COLLECTION,
      key: userId
    });

    if (!existing) {
      throw new Error('Admin not found');
    }

    // Only check for platform governance permission when changing roles
    if (role && role !== existing.data.role && !await hasPermission(currentUserId, 'platform_governance')) {
      throw new Error('Only platform administrators can change roles');
    }

    const updatedData: AdminUser = {
      ...existing.data,
      ...(permissions && { permissions }),
      ...(role && { role }),
      ...(email && { email }),
      ...(name && { name }),
      updatedAt: Date.now(),
      updatedBy: currentUserId
    };

    if (!validateAdminUser(updatedData)) {
      throw new Error('Invalid admin data');
    }

    await setDoc<AdminUser>({
      collection: ADMIN_COLLECTION,
      doc: {
        key: userId,
        data: updatedData,
        version: existing.version
      }
    });
    
    // Log the activity
    await logActivity(
      'admin_updated',
      currentUserId,
      'Admin',
      {
        targetId: userId,
        targetName: existing.data.name || userId,
        status: role || existing.data.role
      }
    );
  } catch (error) {
    console.error('Failed to update admin:', error);
    throw new Error(`Admin update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// New public functions that use request workflow
const addAdmin = async (
  userId: string,
  currentUserId: string,
  role: AdminRole = 'support_agent',
  email: string = '',
  name: string = '',
  reason: string = '',
  permissions?: AdminPermission[]
): Promise<string> => {
  // Check if current user can create admin requests
  if (await canCreateAdminRequests(currentUserId)) {
    // Compliance Officer - create request
    return await createAdminRequest(
      currentUserId,
      'add',
      userId,
      reason || `Add ${name || userId} as ${role}`,
      email,
      name,
      role,
      permissions
    );
  } else if (await canApproveAdminRequests(currentUserId)) {
    // Platform Admin - direct action
    await addAdminDirectly(userId, currentUserId, role, email, name, permissions);
    return 'direct'; // Indicate direct execution
  } else {
    throw new Error('Permission denied: Insufficient privileges to add admin');
  }
};

const removeAdmin = async (
  userId: string,
  currentUserId: string,
  reason: string = ''
): Promise<string> => {
  console.log('🗑️  Starting removeAdmin for:', { userId, currentUserId, reason });
  
  // Get user info for the request
  console.log('🔍 Getting user info for:', userId);
  const userToRemove = await getAdminUser(userId);
  console.log('📋 User to remove:', userToRemove);
  
  // Check permissions
  console.log('🔑 Checking permissions for current user:', currentUserId);
  const canCreateRequests = await canCreateAdminRequests(currentUserId);
  console.log('   - Can create requests (Compliance Officer):', canCreateRequests);
  const canApproveRequests = await canApproveAdminRequests(currentUserId);
  console.log('   - Can approve requests (Platform Admin):', canApproveRequests);
  
  // Check if current user can create admin requests
  if (canCreateRequests) {
    console.log('📝 Creating admin removal request (Compliance Officer path)');
    // Compliance Officer - create request
    return await createAdminRequest(
      currentUserId,
      'remove',
      userId,
      reason || `Remove ${userToRemove?.name || userId} from admin role`,
      userToRemove?.email,
      userToRemove?.name
    );
  } else if (canApproveRequests) {
    console.log('⚡ Executing direct admin removal (Platform Admin path)');
    // Platform Admin - direct action
    await removeAdminDirectly(userId, currentUserId);
    return 'direct'; // Indicate direct execution
  } else {
    console.log('❌ Permission denied for user:', currentUserId);
    throw new Error('Permission denied: Insufficient privileges to remove admin');
  }
};

const listAdmins = async (): Promise<Doc<AdminUser>[]> => {
  try {
    const { items } = await listDocs<AdminUser>({
      collection: ADMIN_COLLECTION
    });
    return items;
  } catch (error) {
    console.error('Failed to list admins:', error);
    return [];
  }
};

export {
  ADMIN_COLLECTION,
  ADMIN_REQUEST_COLLECTION,
  listAdmins,
  isAdmin,
  hasPermission,
  canApproveCauses,
  canManageCauses,
  getAdminUser,
  addAdmin,
  removeAdmin,
  updateAdmin,
  // Admin request workflow functions
  createAdminRequest,
  listAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  canCreateAdminRequests,
  canApproveAdminRequests,
  // Direct admin functions (internal use)
  addAdminDirectly,
  removeAdminDirectly
};

export type { AdminPermission, AdminRole, AdminUser, AdminRequest, AdminRequestType, AdminRequestStatus, AdminRequestDoc };
