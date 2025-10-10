// src/components/ui/loading-button.tsx
'use client';

import React from 'react';
import { Button } from './button';
import { Spinner } from './spinner';

export const LoadingButton = ({
  isLoading,
  loadingText = 'Loading...',
  children,
  size = 'default',
  ...props
}: React.ComponentProps<typeof Button> & {
  isLoading?: boolean;
  loadingText?: string;
}) => (
  <Button
    {...props}
    size={size}
    disabled={isLoading || props.disabled}
    className={`min-h-[44px] sm:min-h-[48px] ${props.className || ''}`}
  >
    {isLoading ? (
      <div className="flex items-center justify-center gap-2">
        <Spinner className="h-4 w-4" />
        <span className="text-xs sm:text-sm">{loadingText}</span>
      </div>
    ) : (
      children
    )}
  </Button>
);