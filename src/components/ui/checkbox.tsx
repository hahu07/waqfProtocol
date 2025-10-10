import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5 mt-0.5">
          <input
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 dark:border-gray-600',
              'text-primary focus:ring-primary dark:focus:ring-primary-300',
              'dark:bg-gray-800 dark:checked:bg-primary-500',
              'min-w-[16px] min-h-[16px]',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="text-sm">
            {label && <label className="font-medium text-gray-700 dark:text-gray-300">{label}</label>}
            {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
