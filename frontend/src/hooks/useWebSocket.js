import { useState, useEffect } from 'react';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setConnectionStatus('connected');
      console.log('Connected to monitoring service');
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(message);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
    
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      console.log('Disconnected from monitoring service');
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [url]);

  return { socket, connectionStatus, lastMessage };
};

export default useWebSocket;