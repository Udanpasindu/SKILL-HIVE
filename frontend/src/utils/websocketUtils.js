import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

/**
 * Creates a configured SockJS/STOMP client
 * @param {string} endpoint - WebSocket endpoint path
 * @returns {Object} STOMP client
 */
export const createStompClient = (endpoint = '/ws') => {
  const socketUrl = `http://localhost:8081${endpoint}`;
  
  // Configure SockJS with proper credentials handling
  const socket = new SockJS(socketUrl, null, {
    transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
    withCredentials: true
  });
  
  const stompClient = Stomp.over(socket);
  
  // Disable debug logs in production
  if (process.env.NODE_ENV === 'production') {
    stompClient.debug = null;
  }
  
  return stompClient;
};
