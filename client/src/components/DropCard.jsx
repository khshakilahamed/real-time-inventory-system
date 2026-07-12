import { useState } from "react";
import StockBadge from "./StockBadge";
import { useAuth } from "../context/AuthContext";

function DropImage({ imageUrl, name }) {
  const [errored, setErrored] = useState(false);

  if (imageUrl && !errored) {
    return (
      <div className="w-full aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={() => setErrored(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-indigo-50 via-gray-100 to-gray-200 flex flex-col items-center justify-center gap-2">
      <svg
        className="w-14 h-14 text-gray-300"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M58 38H10l-4 8h56l-4-8zM6 46h52v4H6zM12 38l6-14h6l-2 6h4l4-6h8l-2 6h4l2-6h6l-4 14H12z" />
      </svg>
      <span className="text-xs text-gray-400 font-medium">No image</span>
    </div>
  );
}

const DropCard = ({ drop, addToast }) => {
  const { user } = useAuth();

  const [isStarted, setIsStarted] = useState(
    () => new Date(drop.startsAt) <= new Date(),
  );

  const handleReserve = async () => {
    addToast({
      message: "Item reserved! You have 60 seconds to purchase.",
      type: "success",
    });
    addToast({
      message: "Item reserved! You have 60 seconds to purchase.",
      type: "error",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative">
      <DropImage imageUrl={drop.imageUrl} name={drop.name} />

      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-base font-semibold text-gray-900 leading-tight">
            {drop.name}
          </h2>
          <StockBadge availableStock={drop.availableStock} />
        </div>

        {/* Price */}
        <p className="text-2xl font-bold text-indigo-600">
          ${parseFloat(drop.price).toFixed(2)}
        </p>

        <button onClick={handleReserve} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-xl transition-colors">
          Reserve
        </button>
      </div>
    </div>
  );
};

export default DropCard;
