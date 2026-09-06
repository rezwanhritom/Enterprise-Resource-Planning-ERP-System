import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? undefined : 'http://localhost:5000');

let socket = null;

export const getSocket = () => {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('token');
  if (!token) return null;

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  // In production, undefined connects to the current host (Render URL).
  socket = io(SOCKET_URL, {
    autoConnect: true,
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};

export default getSocket;
