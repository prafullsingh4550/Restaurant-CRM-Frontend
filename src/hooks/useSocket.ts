import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// ✅ Create one global socket instance
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

// This ensures socket persists across hot reloads in Vite
if (!window._socketInstance) {
  window._socketInstance = io(SOCKET_URL, {
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket'], // optional: use WS directly to avoid polling
  });
}
socket = window._socketInstance;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      // ❗ Do NOT disconnect the socket on unmount (it's global)
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const joinTable = (tableNumber: string) => {
    if (socket && socket.connected) {
      socket.emit('join_table', { tableNumber });
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socket?.off(event, callback);
  };

  return {
    socket,
    isConnected,
    joinTable,
    on,
    off,
  };
};
