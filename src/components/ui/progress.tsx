import * as React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
  ariaLabel?: string;
}

export function Progress({ value, className, ariaLabel = 'Progress indicator' }: ProgressProps) {
  return (
    <div 
      className={`relative h-3 sm:h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className="h-full w-full flex-1 bg-blue-500 transition-all duration-300 ease-out"
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
      />
    </div>
  );
}
