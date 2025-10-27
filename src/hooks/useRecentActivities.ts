// src/hooks/useRecentActivities.ts
import { useState, useEffect } from 'react';
import { getRecentActivities, type ActivityDoc, formatActivityTime, getActivityConfig } from '@/lib/activity-utils';
import { logger } from '@/lib/logger';

export interface FormattedActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  icon: string;
  color: string;
  type: string;
}

export const useRecentActivities = (limit: number = 10) => {
  const [activities, setActivities] = useState<FormattedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const activityDocs = await getRecentActivities(limit);
      
      const formattedActivities: FormattedActivity[] = activityDocs.map((doc) => {
        const config = getActivityConfig(doc.data.type);
        return {
          id: doc.data.id,
          user: doc.data.userName,
          action: doc.data.description,
          time: formatActivityTime(doc.data.timestamp),
          icon: config.icon,
          color: config.color,
          type: doc.data.type
        };
      });
      
      setActivities(formattedActivities);
    } catch (err) {
      logger.error('Error fetching activities', err instanceof Error ? err : { error: err });
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      
      // Fallback to sample data if there's an error
      setActivities([
        {
          id: 'fallback-1',
          user: 'System',
          action: 'No recent activities found',
          time: 'Just now',
          icon: '📝',
          color: 'bg-gradient-to-r from-gray-500 to-slate-500',
          type: 'system'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  const refetch = () => {
    fetchActivities();
  };

  return {
    activities,
    loading,
    error,
    refetch
  };
};