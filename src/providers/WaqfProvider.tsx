'use client';
import React, { createContext, useContext } from 'react';
import { useWaqfStorage } from '@/hooks/useWaqfStorage';

type WaqfContextType = ReturnType<typeof useWaqfStorage>;

const WaqfContext = createContext<WaqfContextType | undefined>(undefined);

export const WaqfProvider = ({ children }: { children: React.ReactNode }) => {
  const storage = useWaqfStorage();

  return (
    <WaqfContext.Provider value={storage}>
      {children}
    </WaqfContext.Provider>
  );
};

export const useWaqf = () => {
  const context = useContext(WaqfContext);
  if (!context) throw new Error('useWaqf must be used within WaqfProvider');
  return context;
};
