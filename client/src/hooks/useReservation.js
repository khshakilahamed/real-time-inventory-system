import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

const storageKey = (dropId) => `reservation:${dropId}`;

function loadStored(dropId) {
  try {
    const raw = localStorage.getItem(storageKey(dropId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Discard if already past expiry
    if (new Date(parsed.expiresAt) <= new Date()) {
      localStorage.removeItem(storageKey(dropId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const useReservation = (dropId) => {
  const { socket } = useSocket();
  const { token } = useAuth();

  // Initialize from localStorage so a page reload restores the active reservation
  const [reservation, setReservationState] = useState(() => loadStored(dropId));
  const [loading, setLoading] = useState(false);

  // Keep localStorage in sync with every state change
  const setReservation = useCallback(
    (value) => {
      setReservationState(value);
      if (value) {
        localStorage.setItem(storageKey(dropId), JSON.stringify(value));
      } else {
        localStorage.removeItem(storageKey(dropId));
      }
    },
    [dropId],
  );

  // Clear when the server signals the reservation expired
  useEffect(() => {
    if (!socket) return;
    const onExpired = ({ dropId: expiredDropId }) => {
      if (expiredDropId === dropId) setReservation(null);
    };
    socket.on("reservation:expired", onExpired);
    return () => socket.off("reservation:expired", onExpired);
  }, [socket, dropId, setReservation]);

  const reserve = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/drops/${dropId}/reserve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReservation(res.data.data);
      return res.data.data;
    } finally {
      setLoading(false);
    }
  }, [dropId, token, setReservation]);

  const purchase = useCallback(async () => {
    if (!reservation) throw new Error("No active reservation");
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/reservations/${reservation.reservationId}/purchase`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReservation(null);
      return res.data.data;
    } finally {
      setLoading(false);
    }
  }, [reservation, token, setReservation]);

  const cancel = useCallback(async () => {
    if (!reservation) return;
    setLoading(true);
    try {
      await axios.delete(`/api/reservations/${reservation.reservationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservation(null);
    } finally {
      setLoading(false);
    }
  }, [reservation, token, setReservation]);

  const clearReservation = useCallback(
    () => setReservation(null),
    [setReservation],
  );

  return { reservation, loading, reserve, purchase, cancel, clearReservation };
};

export default useReservation;
