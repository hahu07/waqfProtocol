// src/lib/cause-utils.ts
import { setDoc, getDoc, listDocs, deleteDoc } from '@junobuild/core';
import { logActivity } from './activity-utils';
import { canApproveCauses, canManageCauses } from './admin-utils';
import type { Cause } from '@/types/waqfs';
import { randomUUID } from './crypto-polyfill';
import { logger } from './logger';

// Collection Name
export const CAUSES_COLLECTION = 'causes';

/**
 * Create a new cause
 */
export const createCause = async (cause: Omit<Cause, 'id' | 'createdAt' | 'updatedAt'>, userId?: string, userName?: string) => {
  try {
    // Check if user has cause management permission (only waqf_manager and platform_admin)
    if (userId && !await canManageCauses(userId)) {
      throw new Error('Permission denied: Only Waqf Managers can create causes');
    }
    
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await setDoc({
      collection: CAUSES_COLLECTION,
      doc: {
        key: id,
        data: {
          ...cause,
          id,
          createdAt: now,
          updatedAt: now,
          isActive: cause.isActive ?? false, // New causes start inactive until approved
          status: 'pending', // All new causes must be approved
          followers: cause.followers || 0,
          fundsRaised: cause.fundsRaised || 0,
          sortOrder: cause.sortOrder || 0
        }
      }
    });
    
    // Log the activity if user info is provided
    if (userId && userName) {
      await logActivity(
        'cause_created',
        userId,
        userName,
        {
          targetId: id,
          targetName: cause.name,
          status: cause.status || 'pending'
        }
      );
    }
    
    return id;
  } catch (error) {
    logger.error('Error creating cause', { error, causeName: cause.name });
    throw new Error('Failed to create cause');
  }
};

/**
 * Get a specific cause by ID
 */
export const getCause = async (id: string): Promise<Cause | undefined> => {
  try {
    const doc = await getDoc({
      collection: CAUSES_COLLECTION,
      key: id
    });
    return doc?.data as Cause | undefined;
  } catch (error) {
    logger.error('Error fetching cause', { error, id });
    throw new Error(`Failed to fetch cause ${id}`);
  }
};

/**
 * Update an existing cause
 */
export const updateCause = async (id: string, updates: Partial<Cause>, userId?: string, userName?: string) => {
  try {
    // First get the full document to get the current version and check what's actually changing
    const docResult = await getDoc({
      collection: CAUSES_COLLECTION,
      key: id
    });
    
    if (!docResult) {
      throw new Error('Cause not found');
    }
    
    const existing = docResult.data as Cause;
    
    // Check permissions based on what's being updated
    if (userId) {
      // If status is being CHANGED (not just included), need approval permission
      const isStatusChanging = updates.status && updates.status !== existing.status;
      if (isStatusChanging && !await canApproveCauses(userId)) {
        throw new Error('Permission denied: Only Compliance Officers and Platform Admins can change cause status');
      }
      
      // If other fields are being changed, need management permission
      const hasNonStatusUpdates = Object.keys(updates).some(key => key !== 'status');
      if (hasNonStatusUpdates && !await canManageCauses(userId)) {
        throw new Error('Permission denied: Only Waqf Managers can edit cause details');
      }
    }
    
    const updatedData = {
      ...existing,
      ...updates,
      id, // Ensure id doesn't change
      updatedAt: new Date().toISOString()
    };
    
    logger.debug('Updating cause with data', { id, updatedData });
    
    await setDoc({
      collection: CAUSES_COLLECTION,
      doc: {
        key: id,
        data: updatedData,
        version: docResult.version // Include the version for optimistic locking
      }
    });
    
    // Log the activity if user info is provided
    if (userId && userName) {
      // Check if status was specifically changed to approved or rejected
      if (updates.status && updates.status !== existing.status) {
        if (updates.status === 'approved') {
          await logActivity(
            'cause_approved',
            userId,
            userName,
            {
              targetId: id,
              targetName: existing.name,
              status: 'approved'
            }
          );
        } else if (updates.status === 'rejected') {
          await logActivity(
            'cause_rejected',
            userId,
            userName,
            {
              targetId: id,
              targetName: existing.name,
              status: 'rejected'
            }
          );
        } else {
          // General status update
          await logActivity(
            'cause_updated',
            userId,
            userName,
            {
              targetId: id,
              targetName: existing.name,
              status: updates.status,
              updatedFields: Object.keys(updates)
            }
          );
        }
      } else {
        // General cause update (no status change)
        await logActivity(
          'cause_updated',
          userId,
          userName,
          {
            targetId: id,
            targetName: existing.name,
            status: updates.status || existing.status,
            updatedFields: Object.keys(updates)
          }
        );
      }
    }
  } catch (error) {
    logger.error('Error updating cause', { error, id, errorMessage: error instanceof Error ? error.message : 'Unknown error' });
    throw error instanceof Error ? error : new Error(`Failed to update cause ${id}`);
  }
};

/**
 * Delete a cause
 */
export const deleteCause = async (id: string, userId?: string, userName?: string) => {
  try {
    // Check if user has cause management permission (only waqf_manager and platform_admin)
    if (userId && !await canManageCauses(userId)) {
      throw new Error('Permission denied: Only Waqf Managers can delete causes');
    }
    
    // Fetch the full document to get both data and version for deletion
    const docResult = await getDoc({
      collection: CAUSES_COLLECTION,
      key: id
    });
    
    if (!docResult) {
      throw new Error('Cause not found');
    }
    
    const cause = docResult.data as Cause;
    
    await deleteDoc({
      collection: CAUSES_COLLECTION,
      doc: docResult // Pass the full document with version
    });
    
    // Log the deletion activity if user info is provided
    if (userId && userName) {
      await logActivity(
        'cause_deleted',
        userId,
        userName,
        {
          targetId: id,
          targetName: cause.name,
          status: cause.status
        }
      );
    }
  } catch (error) {
    logger.error('Error deleting cause', { error, id });
    throw new Error(`Failed to delete cause ${id}`);
  }
};

/**
 * List all causes
 */
export const listCauses = async (): Promise<Cause[]> => {
  try {
    const { items } = await listDocs<Cause>({
      collection: CAUSES_COLLECTION
    });
    return items.map(item => item.data as Cause);
  } catch (error) {
    logger.error('Error listing causes', { error });
    throw new Error('Failed to list causes');
  }
};

/**
 * List active causes only
 */
export const listActiveCauses = async (): Promise<Cause[]> => {
  try {
    const causes = await listCauses();
    return causes.filter(cause => cause.isActive && cause.status === 'approved');
  } catch (error) {
    logger.error('Error listing active causes', { error });
    throw new Error('Failed to list active causes');
  }
};

/**
 * List causes by category
 */
export const listCausesByCategory = async (category: string): Promise<Cause[]> => {
  try {
    const causes = await listCauses();
    return causes.filter(cause => cause.category === category);
  } catch (error) {
    logger.error('Error listing causes by category', { error, category });
    throw new Error(`Failed to list causes for category ${category}`);
  }
};

/**
 * List causes by status
 */
export const listCausesByStatus = async (status: 'pending' | 'approved' | 'rejected'): Promise<Cause[]> => {
  try {
    const causes = await listCauses();
    return causes.filter(cause => cause.status === status);
  } catch (error) {
    logger.error('Error listing causes by status', { error, status });
    throw new Error(`Failed to list causes with status ${status}`);
  }
};

/**
 * Activate a cause
 */
export const activateCause = async (id: string) => {
  try {
    await updateCause(id, { isActive: true });
  } catch (error) {
    logger.error('Error activating cause', { error, id });
    throw new Error(`Failed to activate cause ${id}`);
  }
};

/**
 * Deactivate a cause
 */
export const deactivateCause = async (id: string) => {
  try {
    await updateCause(id, { isActive: false });
  } catch (error) {
    logger.error('Error deactivating cause', { error, id });
    throw new Error(`Failed to deactivate cause ${id}`);
  }
};

/**
 * Approve a cause
 */
export const approveCause = async (id: string, userId?: string, userName?: string) => {
  try {
    // Check if user has cause approval permission
    if (userId && !await canApproveCauses(userId)) {
      throw new Error('Permission denied: Requires cause approval privileges');
    }
    
    const cause = await getCause(id);
    if (!cause) {
      throw new Error('Cause not found');
    }
    
    await updateCause(id, { status: 'approved', isActive: true }, userId, userName);
    
    // Log the approval activity if user info is provided
    if (userId && userName) {
      await logActivity(
        'cause_approved',
        userId,
        userName,
        {
          targetId: id,
          targetName: cause.name,
          status: 'approved'
        }
      );
    }
  } catch (error) {
    logger.error('Error approving cause', { error, id });
    throw new Error(`Failed to approve cause ${id}`);
  }
};

/**
 * Reject a cause
 */
export const rejectCause = async (id: string, userId?: string, userName?: string) => {
  try {
    // Check if user has cause approval permission
    if (userId && !await canApproveCauses(userId)) {
      throw new Error('Permission denied: Requires cause approval privileges');
    }
    
    const cause = await getCause(id);
    if (!cause) {
      throw new Error('Cause not found');
    }
    
    await updateCause(id, { status: 'rejected', isActive: false }, userId, userName);
    
    // Log the rejection activity if user info is provided
    if (userId && userName) {
      await logActivity(
        'cause_rejected',
        userId,
        userName,
        {
          targetId: id,
          targetName: cause.name,
          status: 'rejected'
        }
      );
    }
  } catch (error) {
    logger.error('Error rejecting cause', { error, id });
    throw new Error(`Failed to reject cause ${id}`);
  }
};

/**
 * Update cause funds raised
 */
export const updateCauseFunds = async (id: string, amount: number) => {
  try {
    const cause = await getCause(id);
    if (!cause) {
      throw new Error('Cause not found');
    }
    
    await updateCause(id, {
      fundsRaised: (cause.fundsRaised || 0) + amount
    });
  } catch (error) {
    logger.error('Error updating cause funds', { error, id, amount });
    throw new Error(`Failed to update funds for cause ${id}`);
  }
};

/**
 * Increment cause followers
 */
export const incrementCauseFollowers = async (id: string) => {
  try {
    const cause = await getCause(id);
    if (!cause) {
      throw new Error('Cause not found');
    }
    
    await updateCause(id, {
      followers: (cause.followers || 0) + 1
    });
  } catch (error) {
    logger.error('Error incrementing cause followers', { error, id });
    throw new Error(`Failed to increment followers for cause ${id}`);
  }
};

/**
 * Decrement cause followers
 */
export const decrementCauseFollowers = async (id: string) => {
  try {
    const cause = await getCause(id);
    if (!cause) {
      throw new Error('Cause not found');
    }
    
    const newFollowers = Math.max(0, (cause.followers || 0) - 1);
    await updateCause(id, {
      followers: newFollowers
    });
  } catch (error) {
    logger.error('Error decrementing cause followers', { error, id });
    throw new Error(`Failed to decrement followers for cause ${id}`);
  }
};

/**
 * Get top causes by funds raised
 */
export const getTopCausesByFunds = async (limit: number = 10): Promise<Cause[]> => {
  try {
    const causes = await listActiveCauses();
    return causes
      .sort((a, b) => (b.fundsRaised || 0) - (a.fundsRaised || 0))
      .slice(0, limit);
  } catch (error) {
    logger.error('Error getting top causes by funds', { error, limit });
    throw new Error('Failed to get top causes');
  }
};

/**
 * Get top causes by impact score
 */
export const getTopCausesByImpact = async (limit: number = 10): Promise<Cause[]> => {
  try {
    const causes = await listActiveCauses();
    return causes
      .filter(cause => cause.impactScore !== undefined)
      .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0))
      .slice(0, limit);
  } catch (error) {
    logger.error('Error getting top causes by impact', { error, limit });
    throw new Error('Failed to get top causes by impact');
  }
};

/**
 * List pending causes (for admin review)
 */
export const listPendingCauses = async (): Promise<Cause[]> => {
  try {
    const causes = await listCauses();
    return causes.filter(cause => cause.status === 'pending');
  } catch (error) {
    logger.error('Error listing pending causes', { error });
    throw new Error('Failed to list pending causes');
  }
};

/**
 * List all causes with their approval status (for admin management)
 */
export const listAllCausesForAdmin = async (): Promise<Cause[]> => {
  try {
    return await listCauses(); // All causes regardless of status
  } catch (error) {
    logger.error('Error listing all causes for admin', { error });
    throw new Error('Failed to list all causes for admin');
  }
};

/**
 * List causes by approval status with count information
 */
export const getCausesByStatus = async () => {
  try {
    const allCauses = await listCauses();
    const pending = allCauses.filter(c => c.status === 'pending');
    const approved = allCauses.filter(c => c.status === 'approved');
    const rejected = allCauses.filter(c => c.status === 'rejected');
    
    return {
      all: allCauses,
      pending: pending,
      approved: approved,
      rejected: rejected,
      counts: {
        total: allCauses.length,
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        active: approved.filter(c => c.isActive).length
      }
    };
  } catch (error) {
    logger.error('Error getting causes by status', { error });
    throw new Error('Failed to get causes by status');
  }
};

/**
 * Get causes statistics
 */
export const getCausesStatistics = async () => {
  try {
    const causes = await listCauses();
    const activeCauses = causes.filter(c => c.isActive);
    const totalFunds = causes.reduce((sum, c) => sum + (c.fundsRaised || 0), 0);
    const totalFollowers = causes.reduce((sum, c) => sum + (c.followers || 0), 0);
    
    return {
      totalCauses: causes.length,
      activeCauses: activeCauses.length,
      pendingCauses: causes.filter(c => c.status === 'pending').length,
      approvedCauses: causes.filter(c => c.status === 'approved').length,
      rejectedCauses: causes.filter(c => c.status === 'rejected').length,
      totalFundsRaised: totalFunds,
      totalFollowers: totalFollowers,
      averageFundsPerCause: causes.length > 0 ? totalFunds / causes.length : 0,
      averageFollowersPerCause: causes.length > 0 ? totalFollowers / causes.length : 0
    };
  } catch (error) {
    logger.error('Error getting causes statistics', { error });
    throw new Error('Failed to get causes statistics');
  }
};
