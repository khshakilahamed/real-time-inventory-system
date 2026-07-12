import { useState, useEffect } from "react";

function calcRemaining(startsAt) {
  return Math.max(0, Math.floor((new Date(startsAt) - Date.now()) / 1000));
}

function format(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DropCountdown = ({ startsAt, onStart }) => {
  const [seconds, setSeconds] = useState(() => calcRemaining(startsAt));

  useEffect(() => {
    setSeconds(calcRemaining(startsAt));

    const interval = setInterval(() => {
      const remaining = calcRemaining(startsAt);
      setSeconds(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onStart?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startsAt]);

  const urgent = seconds <= 60;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
      ${urgent ? "bg-orange-50 text-orange-600" : "bg-amber-50 text-amber-700"}`}
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
      <span>Drop starts in</span>
      <span
        className={`tabular-nums font-bold text-base ${urgent ? "animate-pulse" : ""}`}
      >
        {format(seconds)}
      </span>
    </div>
  );
};

export default DropCountdown;
