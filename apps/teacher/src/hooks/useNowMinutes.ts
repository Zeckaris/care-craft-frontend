/**
 * useNowMinutes: current minutes-since-midnight on the device clock.
 *
 * Recomputes every minute (aligned to the minute boundary) and immediately when
 * the app returns to the foreground, so the "Now" highlight stays accurate
 * without a constant ticking timer.
 */
import { useEffect, useState } from 'react';
import { nowMinutes } from '@/lib/mySchedule';

export function useNowMinutes(): number {
  const [value, setValue] = useState(() => nowMinutes());

  useEffect(() => {
    let timer: number | undefined;
    let cancelled = false;

    const tick = () => setValue(nowMinutes());

    const schedule = () => {
      if (cancelled) return;
      const now = new Date();
      const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      timer = window.setTimeout(() => {
        tick();
        schedule();
      }, Math.max(1000, msToNextMinute));
    };

    schedule();

    const onForeground = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onForeground);
    window.addEventListener('focus', onForeground);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onForeground);
      window.removeEventListener('focus', onForeground);
    };
  }, []);

  return value;
}
