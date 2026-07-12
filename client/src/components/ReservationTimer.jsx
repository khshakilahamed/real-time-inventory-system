import { useState, useEffect } from "react";

const ReservationTimer = ({ expiresAt, onExpire }) => {
  const calcSeconds = () =>
    Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));

  const [seconds, setSeconds] = useState(calcSeconds);

  useEffect(() => {
    setSeconds(calcSeconds());
    const interval = setInterval(() => {
      const remaining = calcSeconds();
      setSeconds(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const urgent = seconds <= 15;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium ${urgent ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Reserved — expires in</span>
      <span
        className={`tabular-nums font-bold text-base ${urgent ? "animate-pulse" : ""}`}
      >
        {mm}:{ss}
      </span>
    </div>
  );
};

export default ReservationTimer;
