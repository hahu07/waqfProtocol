// src/lib/activity-utils.ts
import { listDocs, setDoc, type Doc } from '@junobuild/core';

// Import ListOrderField type from another file since it's project-specific
type ListOrderField = 'created_at' | 'updated_at';

export type ActivityType = 
  | 'waqf_created'
  | 'waqf_updated' 
  | 'waqf_deleted'
  | 'cause_created'
  | 'cause_approved'
  | 'cause_rejected'
  | 'cause_updated'
  | 'cause_deleted'
  | 'donation_received'
  | 'allocation_created'
  | 'admin_added'
  | 'admin_removed'
  | 'admin_updated'
  | 'admin_request_created'
  | 'admin_request_approved'
  | 'admin_request_rejected'
  | 'user_registered'
  | 'report_generated'
  | 'system_backup'
  | 'login_activity'
  | 'settings_updated';

export interface ActivityData {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  description: string;
  timestamp: number;
  metadata?: {
    targetId?: string;
    targetName?: string;
    amount?: number;
    status?: string;
    [key: string]: any;
  };
}

export interface ActivityDoc extends Doc<ActivityData> {}

const ACTIVITY_COLLECTION = 'platform_activities';

// Activity type configurations with icons and descriptions
const ACTIVITY_CONFIGS: Record<ActivityType, { 
  icon: string; 
  color: string;
  getDescription: (data: ActivityData) => string;
}> = {
  waqf_created: {
    icon: '🕌',
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    getDescription: (data) => `created new Waqf endowment "${data.metadata?.targetName || 'Unknown'}"`
  },
  waqf_updated: {
    icon: '📝',
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    getDescription: (data) => `updated Waqf endowment "${data.metadata?.targetName || 'Unknown'}"`
  },
  waqf_deleted: {
    icon: '🗑️',
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
    getDescription: (data) => `deleted Waqf endowment "${data.metadata?.targetName || 'Unknown'}"`
  },
  cause_created: {
    icon: '🎯',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    getDescription: (data) => `created new charitable cause "${data.metadata?.targetName || 'Unknown'}"`
  },
  cause_approved: {
    icon: '✅',
    color: 'bg-gradient-to-r from-green-500 to-teal-500',
    getDescription: (data) => `approved charitable cause "${data.metadata?.targetName || 'Unknown'}"`
  },
  cause_rejected: {
    icon: '❌',
    color: 'bg-gradient-to-r from-red-500 to-orange-500',
    getDescription: (data) => `rejected charitable cause "${data.metadata?.targetName || 'Unknown'}"`
  },
  cause_updated: {
    icon: '🔄',
    color: 'bg-gradient-to-r from-purple-500 to-violet-500',
    getDescription: (data) => `updated charitable cause "${data.metadata?.targetName || 'Unknown'}"`
  },
  cause_deleted: {
    icon: '🗑️',
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
    getDescription: (data) => `deleted charitable cause "${data.metadata?.targetName || 'Unknown'}"`
  },
  donation_received: {
    icon: '💰',
    color: 'bg-gradient-to-r from-green-500 to-lime-500',
    getDescription: (data) => `received donation of ${data.metadata?.amount || '0'} for "${data.metadata?.targetName || 'Unknown'}"`
  },
  allocation_created: {
    icon: '📊',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    getDescription: (data) => `created new allocation of ${data.metadata?.amount || '0'}`
  },
  admin_added: {
    icon: '👤',
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    getDescription: (data) => `added new administrator "${data.metadata?.targetName || 'Unknown'}"`
  },
  admin_removed: {
    icon: '👋',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    getDescription: (data) => `removed administrator "${data.metadata?.targetName || 'Unknown'}"`
  },
  admin_updated: {
    icon: '⚙️',
    color: 'bg-gradient-to-r from-gray-500 to-slate-500',
    getDescription: (data) => `updated administrator permissions for "${data.metadata?.targetName || 'Unknown'}"`
  },
  admin_request_created: {
    icon: '📝',
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    getDescription: (data) => `created admin ${data.metadata?.status || 'change'} request for "${data.metadata?.targetName || 'Unknown'}"`
  },
  admin_request_approved: {
    icon: '✅',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    getDescription: (data) => `approved admin ${data.metadata?.status || 'change'} request for "${data.metadata?.targetName || 'Unknown'}"`
  },
  admin_request_rejected: {
    icon: '❌',
    color: 'bg-gradient-to-r from-red-500 to-orange-500',
    getDescription: (data) => `rejected admin ${data.metadata?.status || 'change'} request for "${data.metadata?.targetName || 'Unknown'}"`
  },
  user_registered: {
    icon: '🎉',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    getDescription: (data) => `registered as a new user`
  },
  report_generated: {
    icon: '📄',
    color: 'bg-gradient-to-r from-teal-500 to-cyan-500',
    getDescription: (data) => `generated ${data.metadata?.targetName || 'system'} report`
  },
  system_backup: {
    icon: '💾',
    color: 'bg-gradient-to-r from-slate-500 to-gray-600',
    getDescription: () => `performed automated system backup`
  },
  login_activity: {
    icon: '🔐',
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    getDescription: () => `logged into the platform`
  },
  settings_updated: {
    icon: '🔧',
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
    getDescription: (data) => `updated ${data.metadata?.targetName || 'system'} settings`
  }
};

/**
 * Log a platform activity
 */
export const logActivity = async (
  type: ActivityType,
  userId: string,
  userName: string,
  metadata?: ActivityData['metadata']
): Promise<void> => {
  try {
    const activityId = `${Date.now()}-${type}-${userId}`;
    const config = ACTIVITY_CONFIGS[type];
    
    const activityData: ActivityData = {
      id: activityId,
      type,
      userId,
      userName,
      description: config.getDescription({ 
        id: activityId, 
        type, 
        userId, 
        userName, 
        description: '', 
        timestamp: Date.now(), 
        metadata 
      }),
      timestamp: Date.now(),
      metadata
    };

    await setDoc<ActivityData>({
      collection: ACTIVITY_COLLECTION,
      doc: {
        key: activityId,
        data: activityData
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

/**
 * Get recent platform activities
 */
export const getRecentActivities = async (limit: number = 10): Promise<ActivityDoc[]> => {
  try {
    const { items } = await listDocs<ActivityData>({
      collection: ACTIVITY_COLLECTION,
      filter: {
        order: {
          desc: true,
          field: 'created_at'
        }
      }
    });
    
    return items.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return [];
  }
};

/**
 * Get activities for a specific user
 */
export const getUserActivities = async (userId: string, limit: number = 10): Promise<ActivityDoc[]> => {
  try {
    const { items } = await listDocs<ActivityData>({
      collection: ACTIVITY_COLLECTION,
      filter: {
        order: {
          desc: true,
          field: 'created_at'
        }
      }
    });
    
    return items
      .filter(item => item.data.userId === userId)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch user activities:', error);
    return [];
  }
};

/**
 * Get activity configuration (icon, color, etc.)
 */
export const getActivityConfig = (type: ActivityType) => {
  return ACTIVITY_CONFIGS[type];
};

/**
 * Format activity timestamp for display
 */
export const formatActivityTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Clear old activities (cleanup function)
 */
export const cleanupOldActivities = async (daysToKeep: number = 30): Promise<void> => {
  try {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const { items } = await listDocs<ActivityData>({
      collection: ACTIVITY_COLLECTION
    });
    
    const oldActivities = items.filter(item => item.data.timestamp < cutoffTime);
    
    // Note: You would need to implement deleteDoc for each old activity
    // This is a placeholder for the cleanup logic
    console.log(`Found ${oldActivities.length} old activities to clean up`);
  } catch (error) {
    console.error('Failed to cleanup old activities:', error);
  }
};