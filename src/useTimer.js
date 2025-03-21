import { useState, useEffect, useRef } from "react";

const useTimer = (initialTime, onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);
  const timerBarRef = useRef(null);

  const startTimer = (seconds = initialTime) => {
    clearTimeout(timerRef.current);
    setTimeLeft(seconds);

    if (timerBarRef.current) {
      timerBarRef.current.style.transition = "none";
      timerBarRef.current.style.width = "100%";
      void timerBarRef.current.offsetWidth; // force reflow
      timerBarRef.current.style.transition = `width ${seconds}s linear`;
      timerBarRef.current.style.width = "0%";
    }

    timerRef.current = setTimeout(() => {
      onTimeout();
    }, seconds * 1000);
  };

  const stopTimer = () => {
    clearTimeout(timerRef.current);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  return {
    timeLeft,
    startTimer,
    stopTimer,
    timerBarRef,
  };
};

export default useTimer;
