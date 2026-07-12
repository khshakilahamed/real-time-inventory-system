import { useState } from "react";
import StockBadge from "./StockBadge";
import { useAuth } from "../context/AuthContext";
import useReservation from "../hooks/useReservation";
import useDropSocket from "../hooks/useDropSocket";
import DropCountdown from "./DropCountdown";
import ReservationTimer from "./ReservationTimer";
import ActivityFeed from "./ActivityFeed";
import { useNavigate } from "react-router-dom";

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
  const { availableStock, recentActivity } = useDropSocket(
    drop.id,
    drop.availableStock,
  );
  const { reservation, loading, reserve, purchase, cancel, clearReservation } =
    useReservation(drop.id);
    const navigate = useNavigate();

  const handleReserve = async () => {
    if (!user) {
      navigate('/login')
      return;
    }
    try {
      await reserve();
      addToast({
        message: "Item reserved! You have 60 seconds to purchase.",
        type: "success",
      });
    } catch (err) {
      const { data } = err.response;
      addToast({
        message: data.message ?? "Failed to reserve. Please try again.",
        type: "error",
      });
    }
  };

  const handlePurchase = async () => {
    try {
      await purchase();
      addToast({ message: "Purchase complete! Congrats!", type: "success" });
    } catch (err) {
      const { data } = err.response;
      addToast({
        message: data.message ?? "Purchase failed. Please try again.",
        type: "error",
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancel();
      addToast({ message: "Reservation cancelled.", type: "success" });
    } catch (err) {
      const { data } = err.response;
      addToast({
        message: data.message ?? "Could not cancel reservation.",
        type: "error",
      });
    }
  };

  const handleExpire = () => {
    clearReservation();
    addToast({ message: "Your reservation expired.", type: "error" });
  };

  const [isStarted, setIsStarted] = useState(
    () => new Date(drop.startsAt) <= new Date(),
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <DropImage imageUrl={drop.imageUrl} name={drop.name} />

      <div className="p-5 flex flex-col gap-4 h-full flex-1">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-base font-semibold text-gray-900 leading-tight">
            {drop.name}
          </h2>
          <StockBadge availableStock={availableStock} />
        </div>

        {/* Price */}
        <p className="text-2xl font-bold text-indigo-600">
          ${parseFloat(drop.price).toFixed(2)}
        </p>

        {/* Countdown until drop goes live */}
        {!isStarted && (
          <DropCountdown
            startsAt={drop.startsAt}
            onStart={() => setIsStarted(true)}
          />
        )}

        {/* Activity feed */}
        <ActivityFeed
          initialPurchasers={drop.recentPurchasers}
          liveActivity={recentActivity}
        />

        {/* Reservation zone */}
        {reservation ? (
          <div className="space-y-2 mt-auto">
            <ReservationTimer
              expiresAt={reservation.expiresAt}
              onExpire={handleExpire}
            />
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Complete Purchase"
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Cancel reservation
            </button>
          </div>
        ) : (
          <button
            onClick={handleReserve}
            disabled={loading || availableStock === 0 || !isStarted}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-xl transition-colors mt-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Reserving...
              </span>
            ) : availableStock === 0 ? (
              "Sold Out"
            ) : !isStarted ? (
              "Not Started"
            ) : (
              "Reserve"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DropCard;
