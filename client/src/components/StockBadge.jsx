import { useEffect, useRef, useState } from 'react';

const StockBadge = ({ availableStock }) => {
  const [flash, setFlash] = useState(false);
  const prev = useRef(availableStock);

  useEffect(() => {
    if (prev.current !== availableStock) {
      prev.current = availableStock;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 700);
      return () => clearTimeout(t);
    }
  }, [availableStock]);

  const color =
    availableStock === 0
      ? "bg-red-100 text-red-700 border-red-200"
      : availableStock <= 3
        ? "bg-orange-100 text-orange-700 border-orange-200"
        : "bg-green-100 text-green-700 border-green-200";

  return (
    <span
      className={`
        inline-flex items-center border px-2.5 py-0.5 rounded-full text-xs font-semibold
        transition-all duration-300 select-none whitespace-nowrap w-max
        ${color}
        ${flash ? "scale-110 shadow-md ring-2 ring-offset-1 ring-current" : ""}
      `}
    >
      {availableStock === 0 ? "Sold Out" : `${availableStock} left`}
    </span>
  );
};

export default StockBadge;
