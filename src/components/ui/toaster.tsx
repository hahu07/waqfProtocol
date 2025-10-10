// src/components/ui/toast.tsx
'use client';

import React, { useEffect } from 'react';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
};

export const Toast = ({ message, type, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      className={`fixed z-50 inset-x-0 bottom-0 sm:top-4 sm:inset-x-auto sm:right-4 w-full sm:w-auto sm:max-w-md p-4 rounded-t-lg sm:rounded-md shadow-lg transition-transform duration-300 ease-out ${type === 'error' 
        ? 'bg-red-500 dark:bg-red-600 text-white' 
        : 'bg-green-500 dark:bg-green-600 text-white'
      }`}
      style={{
        transform: 'translateY(0)'
      }}
    >
      <p className="text-sm sm:text-base text-center sm:text-left">{message}</p>
    </div>
  );
};