// src/components/admin/AuditLog.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecentActivities, getActivityConfig, formatActivityTime, type ActivityDoc } from '@/lib/activity-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AuditLog() {
  const { data: logs, isLoading } = useQuery<ActivityDoc[]>({
    queryKey: ['platform_activities'],
    queryFn: async () => {
      return await getRecentActivities(50); // Get more recent activities
    }
  });
  
  if (isLoading) return (
    <div className="border rounded-lg p-6 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
    </div>
  );
  if (!logs || logs.length === 0) return <div className="text-gray-500">No audit logs found</div>;

  return (
    <div className="border rounded-lg overflow-hidden mt-4">
      <h3 className="font-medium p-3 sm:p-4 border-b text-sm sm:text-base">Platform Activity Log</h3>
      <div className="overflow-x-auto">
        <Table className="min-w-[600px] sm:min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Activity</TableHead>
              <TableHead className="text-xs sm:text-sm">User</TableHead>
              <TableHead className="text-xs sm:text-sm">Target</TableHead>
              <TableHead className="text-xs sm:text-sm">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const config = getActivityConfig(log.data.type);
              return (
                <TableRow key={log.key}>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{log.data.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{log.data.userName}</TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {log.data.metadata?.targetName || log.data.metadata?.targetId || '-'}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {formatActivityTime(log.data.timestamp)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}