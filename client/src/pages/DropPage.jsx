import { useState, useEffect } from "react";
import axios from "axios";
import DropCard from "../components/DropCard";
import useToast from "../hooks/useToast";
import Toast from "../components/Toast";

const DropPage = () => {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    axios
      .get("/api/drops")
      .then((res) => setDrops(res.data.data))
      .catch(() =>
        addToast({ message: "Failed to load drops.", type: "error" }),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Live Drops</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Reserve before they sell out — you have 60 seconds to complete your
          purchase.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-5 h-52 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-9 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : drops.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No drops available right now.</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} addToast={addToast} />
          ))}
        </div>
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DropPage;
