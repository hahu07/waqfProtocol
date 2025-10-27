// src/lib/auth-utils.ts
import { onAuthStateChange, User } from '@junobuild/core';
import { isAdmin } from './admin-utils';
import { logger } from './logger';

interface AuthStatus {
  isAuthenticated: boolean;
  userId?: string;
  isAdmin: boolean;
}

export const getAuthStatus = async (): Promise<AuthStatus> => {
  try {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChange(async (user: User | null) => {
        const userId = user?.key;
        const admin = userId ? await isAdmin(userId) : false;
        
        resolve({
          isAuthenticated: user !== null,
          userId,
          isAdmin: admin
        });
        unsubscribe();
      });
    });
  } catch (error) {
    logger.error('Failed to get auth status', { error });
    return { isAuthenticated: false, isAdmin: false };
  }
};