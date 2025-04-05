import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const stompClientRef = useRef(null);

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    if (currentUser) {
      const socket = new SockJS('http://localhost:8081/ws');
      const stompClient = Stomp.over(socket);
      
      stompClient.debug = null;
      
      const onConnect = () => {
        console.log('WebSocket connected for notifications');
        
        stompClient.subscribe(`/user/${currentUser.id}/queue/notifications`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            console.log("Received notification:", notification);
            
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/notification-icon.png' // Add an icon if you have one
              });
            }
          } catch (error) {
            console.error('Error processing notification:', error);
          }
        });
      };

      const onError = (error) => {
        console.error('WebSocket connection error:', error);
        setTimeout(() => connect(), 5000);
      };

      const connect = () => {
        stompClient.connect({}, onConnect, onError);
      };

      connect();
      
      return () => {
        if (stompClient?.connected) {
          stompClient.disconnect();
        }
      };
    }
  }, [currentUser]);

  // Fetch notifications on component mount
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8081/api/notifications/user/${currentUser.id}`);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`http://localhost:8081/api/notifications/user/${currentUser.id}/unread/count`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8081/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAsUnread = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8081/api/notifications/${notificationId}/unread`);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: false } : n
      ));
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser || unreadCount === 0) return;
    
    try {
      await axios.put(`http://localhost:8081/api/notifications/user/${currentUser.id}/read-all`);
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:8081/api/notifications/${notificationId}`);
      
      // Update local state
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      await axios.post(`http://localhost:8081/api/notifications/${notification.id}/read`);
      
      // Update the notification's read status locally
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate based on notification type
      if (notification.type === 'MENTION') {
        navigate(`/post/${notification.relatedItemId}`);
      }
      // ...existing code for other notification types...
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffSecs < 60) return `${diffSecs} sec ago`;
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'LIKE': return 'bg-pink-100 text-pink-700';
      case 'COMMENT': return 'bg-blue-100 text-blue-700';
      case 'MENTION': return 'bg-purple-100 text-purple-700';
      case 'FOLLOW': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 text-gray-100 hover:text-white rounded-full focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-sm text-indigo-600 hover:text-indigo-800"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-96">
            {loading ? (
              <div className="py-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-indigo-500'}`}></div>
                      
                      <div 
                        className="flex-1 ml-3 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="font-medium text-gray-800">{notification.title}</div>
                        <div className="text-sm text-gray-600">{notification.message}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-2">
                        <div className="relative group">
                          <button className="p-1 rounded-full hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </button>
                          
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            {notification.read ? (
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsUnread(notification.id);
                                }}
                              >
                                Mark as unread
                              </button>
                            ) : (
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <button
                className="text-sm text-indigo-600 hover:text-indigo-800"
                onClick={() => navigate('/notifications')}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
