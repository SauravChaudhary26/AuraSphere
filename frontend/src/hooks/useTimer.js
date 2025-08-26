import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialTime, onTimeEnd) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            if (onTimeEnd) {
              onTimeEnd();
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeEnd]);

  const startTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback((newTime) => {
    setTimeLeft(newTime);
    setIsActive(false);
  }, []);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(0);
  }, []);

  return { 
    timeLeft, 
    isActive, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    stopTimer 
  };
};