import { useEffect, useMemo, useState } from 'react';

const formatTimeLeft = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':');
};

export const useCountdown = (deadlineIso: string) => {
  const deadline = useMemo(() => new Date(deadlineIso).getTime(), [deadlineIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [deadline]);

  const timeLeft = Math.max(deadline - now, 0);

  return {
    timeLabel: formatTimeLeft(timeLeft),
    isExpired: timeLeft === 0
  };
};
