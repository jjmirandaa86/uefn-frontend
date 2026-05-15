import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('es-AU', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat('es-AU', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return {
    time: formatter.format(now),
    date: dateFormatter.format(now),
  };
}
