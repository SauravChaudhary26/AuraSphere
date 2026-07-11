import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import { API_BASE, getToken } from "../lib/http";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE;

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Lazily connect with the current auth token (the server requires it).
  const connect = useCallback(() => {
    if (socketRef.current) return socketRef.current;
    const token = getToken();
    if (!token) return null;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      auth: { token },
    });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socketRef.current = socket;
    return socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
