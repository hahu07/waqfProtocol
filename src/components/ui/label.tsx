import * as React from 'react';
import { cn } from '@/lib/utils';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-xs sm:text-sm font-medium leading-none',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        'dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  )
);
Label.displayName = 'Label';
