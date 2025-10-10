'use client';

import { useQuery } from '@tanstack/react-query';
import { listAdmins } from '@/lib/admin-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminStats() {
  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: listAdmins
  });

  const stats = {
    totalAdmins: admins?.length || 0,
    platformAdmins: admins?.filter(a => a.data.permissions.includes('platform_governance')).length || 0,
    waqfManagers: admins?.filter(a => a.data.permissions.includes('waqf_management')).length || 0,
    causeManagers: admins?.filter(a => a.data.permissions.includes('cause_management')).length || 0,
    supportAgents: admins?.filter(a => a.data.permissions.includes('user_support')).length || 0
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="min-h-[120px]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.totalAdmins}</div>
        </CardContent>
      </Card>
      <Card className="min-h-[120px]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">🏛️ Platform Admins</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.platformAdmins}</div>
        </CardContent>
      </Card>
      <Card className="min-h-[120px]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">🕌 Waqf Managers</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.waqfManagers}</div>
        </CardContent>
      </Card>
      <Card className="min-h-[120px]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">🎯 Cause Managers</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.causeManagers}</div>
        </CardContent>
      </Card>
    </div>
  );
}
