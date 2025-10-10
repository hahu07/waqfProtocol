'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SimpleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
};

export function SimpleButton({ 
  children, 
  icon, 
  className = '', 
  variant = 'primary',
  ...props 
}: SimpleButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-600 dark:hover:bg-primary-700',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-dark dark:bg-secondary-600 dark:hover:bg-secondary-700',
    default: 'bg-background text-foreground border hover:bg-accent dark:border-gray-600 dark:hover:bg-gray-700'
  };

  return (
    <button
      className={cn(
        'flex items-center px-4 py-2.5 rounded-md transition-colors min-h-[44px]',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span className="text-sm sm:text-base">{children}</span>
    </button>
  );
}
