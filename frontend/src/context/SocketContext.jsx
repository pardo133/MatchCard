import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../store/userStore';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const token     = useUserStore(state => state.token);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth:       { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket conectado');
    });

    socketRef.current.on('new_match', (data) => {
      toast.success(`¡Nuevo match encontrado! Revisa tus matches.`, {
        duration: 5000,
        icon: '🔄',
      });
    });

    socketRef.current.on('match_updated', (data) => {
      toast(`El match fue ${data.status}`, { icon: 'ℹ️' });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
