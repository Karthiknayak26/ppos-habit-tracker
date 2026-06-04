import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import useStore from '../store/useStore';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const fetchHabits = useStore(state => state.fetchHabits);
  const fetchTasks = useStore(state => state.fetchTasks);

  useEffect(() => {
    if (!user) return;

    // Connect to server
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_user_room', user._id);
    });

    // Listen for real-time updates and trigger Zustand refetches
    newSocket.on('habits_updated', () => {
      fetchHabits();
    });

    newSocket.on('tasks_updated', () => {
      fetchTasks();
    });

    return () => newSocket.disconnect();
  }, [user, fetchHabits, fetchTasks]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
