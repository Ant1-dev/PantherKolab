/**
 * useSocket Hook
 * 
 * React hook that provides Socket.IO access with connection status.
 * Auto-connects on mount and disconnects on unmount.
 */

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket-client";

type ConnectionStatus = "connected" | "connecting" | "disconnected";

interface UseSocketReturn {
  socket: typeof socket;
  isConnected: boolean;
  status: ConnectionStatus;
  error: Error | null;
}

/**
 * Hook to access Socket.IO client with connection status
 * 
 * @returns {UseSocketReturn} Socket instance, connection status, and error
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { socket, isConnected, status, error } = useSocket();
 * 
 *   useEffect(() => {
 *     if (isConnected) {
 *       socket.emit("join-conversation", "conv-123");
 *     }
 *   }, [isConnected]);
 * }
 * ```
 */
export function useSocket(): UseSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<Error | null>(null);

  // Update status when socket status changes
  useEffect(() => {
    // Set initial status
    setStatus(socket.getStatus());

    // Listen for status changes
    const handleStatusChange = (newStatus: ConnectionStatus) => {
      setStatus(newStatus);
      if (newStatus === "connected") {
        setError(null); // Clear errors on successful connection
      }
    };

    // Listen for errors
    const handleError = (err: Error) => {
      setError(err);
      setStatus("disconnected");
    };

    socket.on("status-change", handleStatusChange);
    socket.on("error", handleError);

    // Connect on mount
    socket.connect();

    // Cleanup on unmount
    return () => {
      socket.off("status-change", handleStatusChange);
      socket.off("error", handleError);
      // Note: We don't disconnect here because other components might be using the socket
      // The socket will disconnect when the app unmounts or when explicitly called
    };
  }, []);

  // Get current connection state
  const isConnected = socket.isConnected;

  return {
    socket,
    isConnected,
    status,
    error,
  };
}

export default useSocket;



