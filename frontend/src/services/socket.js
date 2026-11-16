import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  const token = localStorage.getItem('connecthub_token');
  if (!socket && token) {
    const backendUrl = import.meta.env.VITE_API_URL || undefined;
    socket = io(backendUrl || undefined, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[Socket Connected] ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket Connect Error]:', err.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
