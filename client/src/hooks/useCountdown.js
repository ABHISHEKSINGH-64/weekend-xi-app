import { useState, useEffect } from 'react';

export const useCountdown = (dateString, timeString) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true
  });

  useEffect(() => {
    if (!dateString || !timeString) {
      setTimeLeft(prev => ({ ...prev, isExpired: true }));
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      // Combine date YYYY-MM-DD and time HH:MM
      // Since date is local, we parse it as local time
      const targetDate = new Date(`${dateString}T${timeString}:00`);
      
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dateString, timeString]);

  return timeLeft;
};
