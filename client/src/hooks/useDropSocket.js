import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

const useDropSocket = (dropId, initialStock) => {
  const { socket } = useSocket();
  const [availableStock, setAvailableStock] = useState(initialStock);
  const [recentActivity, setRecentActivity] = useState([]);

  // Keep in sync when the parent re-fetches drops
  useEffect(() => {
    setAvailableStock(initialStock);
  }, [initialStock]);

  useEffect(() => {
    if (!socket || !dropId) return;

    socket.emit("join:drop", { dropId });

    const onStockUpdate = ({ dropId: id, availableStock: stock }) => {
      if (id === dropId) setAvailableStock(stock);
    };

    const onPurchaseActivity = ({
      dropId: id,
      firstName,
      lastName,
      purchasedAt,
    }) => {
      if (id === dropId) {
        setRecentActivity((prev) =>
          [{ firstName, lastName, purchasedAt }, ...prev].slice(0, 3),
        );
      }
    };

    socket.on("stock:update", onStockUpdate);
    socket.on("purchase:activity", onPurchaseActivity);

    return () => {
      socket.emit("leave:drop", { dropId });
      socket.off("stock:update", onStockUpdate);
      socket.off("purchase:activity", onPurchaseActivity);
    };
  }, [socket, dropId]);

  return { availableStock, recentActivity };
};

export default useDropSocket;
