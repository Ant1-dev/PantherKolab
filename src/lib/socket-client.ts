/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * Socket.IO Client Singleton
 *
 * Provides a single Socket.IO instance that:
 * - Connects to the Next.js server automatically
 * - Handles reconnection with exponential backoff
 * - Tracks connection status
 * - Manages error handling
 */

import { io, Socket } from "socket.io-client";
import { BASENAME } from "./utils";

type ConnectionStatus = "connected" | "connecting" | "disconnected";

class SocketClient {
  private socket: Socket | null = null;
  private status: ConnectionStatus = "disconnected";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private listeners: Map<string, Function[]> = new Map();

  /**
   * Get the server URL based on environment
   *
   * Priority:
   * 1. NEXT_PUBLIC_SOCKET_URL environment variable (set in .env file)
   * 2. NEXT_PUBLIC_APP_URL (production domain from env)
   * 3. In development: http://localhost:3000 (fallback)
   * 4. In production: current domain (fallback)
   *
   * To use a custom Socket.IO server, just add to .env:
   * NEXT_PUBLIC_SOCKET_URL=http://custom-server-url:port
   */
  private getServerUrl(): string {
    if (typeof window === "undefined") {
      // Server-side rendering - don't connect
      return "";
    }

    // Primary: Use environment variable from .env file
    // This is the main way to configure custom Socket.IO server URL
    if (BASENAME) return BASENAME;

    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      return process.env.NEXT_PUBLIC_SOCKET_URL;
    }

    // Use production app URL if specified
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    // Fallback: In development, use localhost:3000
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3000";
    }

    // Production: use current domain
    return window.location.origin;
  }

  /**
   * Connect to the Socket.IO server with auth token
   */
  async connect(token?: string): Promise<void> {
    if (typeof window === "undefined") {
      console.warn("Socket.IO client can only be used in the browser");
      return;
    }

    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    // If we already have a socket, update auth and reconnect
    if (this.socket && token) {
      this.socket.auth = { token };
      this.socket.connect();
      return;
    }

    const serverUrl = this.getServerUrl();
    if (!serverUrl) {
      console.error("Cannot determine server URL");
      return;
    }

    this.status = "connecting";
    this.reconnectAttempts = 0;

    this.socket = io(serverUrl, {
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      autoConnect: true,
      withCredentials: true, // Important for session cookies
    });

    // Connection event handlers
    this.socket.on("connect", () => {
      console.log("Socket.IO connected:", this.socket?.id);
      this.status = "connected";
      this.reconnectAttempts = 0;
      this.emitInternal("status-change", "connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
      this.status = "disconnected";
      this.emitInternal("status-change", "disconnected");

      // If it's an unexpected disconnect, try to reconnect
      if (reason === "io server disconnect") {
        // Server disconnected, reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
      this.status = "disconnected";
      this.reconnectAttempts++;
      this.emitInternal("status-change", "disconnected");

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.emitInternal(
          "error",
          new Error("Failed to connect after multiple attempts")
        );
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket.IO reconnected after", attemptNumber, "attempts");
      this.status = "connected";
      this.reconnectAttempts = 0;
      this.emitInternal("status-change", "connected");
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Socket.IO reconnection attempt", attemptNumber);
      this.status = "connecting";
      this.emitInternal("status-change", "connecting");
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Socket.IO reconnection failed");
      this.status = "disconnected";
      this.emitInternal("error", new Error("Reconnection failed"));
    });

    // Forward error events
    this.socket.on("error", (error) => {
      console.error("Socket.IO error:", error);
      this.emitInternal("error", error);
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.status = "disconnected";
      this.listeners.clear();
    }
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: unknown): void {
    if (!this.socket || !this.socket.connected) {
      console.warn(`Cannot emit "${event}": socket not connected`);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Listen to an event from the server
   */
  on(event: string, handler: Function): void {
    if (!this.socket) {
      console.warn(`Cannot listen to "${event}": socket not initialized`);
      return;
    }

    // Store handler for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(handler);

    this.socket.on(event, handler as any);
  }

  /**
   * Remove an event listener
   */
  off(event: string, handler?: Function): void {
    if (!this.socket) return;

    if (handler) {
      this.socket.off(event, handler as any);
      // Remove from listeners map
      const handlers = this.listeners.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    } else {
      // Remove all listeners for this event
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Check if socket is connected
   */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get the underlying socket instance (use with caution)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Clean up all listeners (for cleanup)
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }

  /**
   * Internal method to emit status/error events to registered listeners
   */
  private emitInternal(event: string, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const socket = new SocketClient();

// Export the class for testing if needed
export default SocketClient;
