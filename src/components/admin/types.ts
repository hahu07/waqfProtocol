// Admin component prop types
import { Doc } from '@junobuild/core';
import type { AdminUser } from '@/lib/admin-utils';

export interface AdminComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface AdminManagerProps extends AdminComponentProps {
  requireTwoFactor?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  admins?: Doc<AdminUser>[];
  isLoading?: boolean;
}
