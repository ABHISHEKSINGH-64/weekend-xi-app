import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Dynamically connect to the backend server based on host
    const hostname = window.location.hostname;
    const socketUrl = `http://${hostname}:5000`;
    
    console.log(`[SOCKET] Connecting to: ${socketUrl}`);
    const newSocket = io(socketUrl);

    setSocket(newSocket);

    return () => {
      console.log('[SOCKET] Disconnecting socket...');
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
