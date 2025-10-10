import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [status, setStatus] = useState<'online'|'offline'|'unknown'>(() => {
    return typeof window !== 'undefined' 
      ? navigator.onLine ? 'online' : 'offline'
      : 'unknown';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline: status === 'online',
    isOffline: status === 'offline',
    status
  };
}
