/**
 * useOnlineStatus — reliable online/offline signal.
 *
 * Uses both the `navigator.onLine` property and the `online`/`offline`
 * window events so the signal updates reactively.
 *
 * This is the foundation the offline write-queue (future attendance task)
 * will rely on.  Import this hook wherever an online/offline indicator is
 * needed, or wherever mutations must decide whether to enqueue locally.
 */
import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}
