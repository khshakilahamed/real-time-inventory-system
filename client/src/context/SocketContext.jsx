import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Dev: relative "/" goes through the Vite proxy. Prod: VITE_API_BASE_URL points straight at the server.
    const s = io(import.meta.env.VITE_API_BASE_URL || "/", { autoConnect: true });
    setSocket(s);

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    return () => {
      s.disconnect();
    };
  }, []);

  // Re-authenticate when token changes (login / logout)
  useEffect(() => {
    if (socket && connected && token) {
      socket.emit("authenticate", { token });
    }
  }, [socket, connected, token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
