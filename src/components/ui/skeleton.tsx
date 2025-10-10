'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md',
        'data-[mobile=true]:h-4 data-[mobile=true]:w-20',
        className
      )}
    />
  );
}
