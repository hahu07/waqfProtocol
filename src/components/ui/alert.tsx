import { cn } from '@/lib/utils';
import * as React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success';
}

export function Alert({
  className,
  variant = 'default',
  ...props
}: AlertProps) {
  const variantClasses = {
    default: 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
    destructive: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300',
    success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300'
  };
  
  return (
    <div
      className={cn(
        'rounded-md border p-3 sm:p-4',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <h4
      className={cn('mb-1 text-sm sm:text-base font-medium leading-none tracking-tight', className)}
      {...props}
    />
  );
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <p className={cn('text-xs sm:text-sm [&_p]:leading-relaxed', className)} {...props} />
  );
}
