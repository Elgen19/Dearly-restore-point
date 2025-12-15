// NotificationBell.jsx - Real-time notification system using Firebase
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../config/firebase';
import { ref, onValue, get } from 'firebase/database';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Helper function to check if a notification is read
  // Handles all possible ways Firebase might store the boolean
  const isNotificationRead = (notification) => {
    const readValue = notification.read;
    
    // Check if it's explicitly true (boolean)
    if (readValue === true) return true;
    
    // Check if it's the string "true"
    if (typeof readValue === 'string' && readValue.toLowerCase() === 'true') return true;
    
    // Check if it's the number 1
    if (readValue === 1) return true;
    
    // Everything else (false, null, undefined, "false", 0, etc.) is unread
    return false;
  };

  // Filter out unnecessary notifications
  const filterNotifications = (notificationsArray) => {
    return notificationsArray.filter((notification) => {
      const message = notification.message || '';
      const lowerMessage = message.toLowerCase();
      
      // Filter out generic messages
      if (lowerMessage.includes('date invitation response received') ||
          lowerMessage.includes('new notification') ||
          lowerMessage === 'new notification' ||
          (notification.type === 'date_invitation_rsvp' && notification.status !== 'accepted' && !notification.date)) {
        return false;
      }
      
      return true;
    });
  };

  // Fetch notifications via API (fallback) when Firebase direct access fails
  const fetchNotificationsViaAPI = async () => {
    if (!currentUser) return;
    
    try {
      const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const response = await fetch(`${backendUrl}/api/notifications/${currentUser.uid}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const allNotifications = result.notifications || [];
          // Calculate unread count from ALL notifications (before filtering)
          const unreadCount = allNotifications.filter(n => {
            return !isNotificationRead(n);
          }).length;
          // Filter for display only
          const filtered = filterNotifications(allNotifications);
          setNotifications(filtered);
          setUnreadCount(unreadCount);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications via API:', error);
    }
  };

  // Listen to Firebase for real-time notifications
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const notificationsRef = ref(database, `users/${currentUser.uid}/notifications`);

    console.log('🔔 Setting up Firebase listener for notifications...');
    console.log('🔔 User ID:', currentUser.uid);
    console.log('🔔 Database path:', `users/${currentUser.uid}/notifications`);

    // Set up real-time listener
    const unsubscribe = onValue(
      notificationsRef, 
      (snapshot) => {
        const data = snapshot.val();
        
        console.log('📬 Notifications data received:', data);
        
        if (!data) {
          console.log('📬 No notifications found (empty data)');
          setNotifications([]);
          setUnreadCount(0);
          setIsLoading(false);
          return;
        }

        // Convert to array and sort by createdAt (newest first)
        let allNotificationsArray = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        })).sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        // Calculate unread count from ALL notifications (before filtering)
        // Badge count should reflect all unread notifications, not just filtered ones
        const unreadNotifications = allNotificationsArray.filter(n => {
          const isRead = isNotificationRead(n);
          
          // Log each notification's read status for debugging
          console.log(`📋 [Firebase Listener] Notification ${n.id.substring(0, 8)}...: read = ${JSON.stringify(n.read)} (type: ${typeof n.read}), isRead = ${isRead}`);
          
          // Return true if NOT read (i.e., unread)
          return !isRead;
        });
        
        // Debug logging
        console.log(`📊 [Firebase Listener] Notification Status Check:`);
        console.log(`   Total notifications: ${allNotificationsArray.length}`);
        console.log(`   Unread count: ${unreadNotifications.length}`);
        console.log(`   Unread notification IDs:`, unreadNotifications.map(n => n.id.substring(0, 8) + '...'));
        
        // Filter out unnecessary/generic notifications for display only
        const filteredNotifications = filterNotifications(allNotificationsArray);
        
        setNotifications(filteredNotifications);
        setUnreadCount(unreadNotifications.length);
        setIsLoading(false);
      }, 
      (error) => {
        console.error('❌ Error listening to notifications:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', error);
        
        // Fallback to API if Firebase fails
        console.log('🔄 Falling back to API fetch...');
        fetchNotificationsViaAPI();
      }
    );

    // Also try API fetch initially as a fallback
    fetchNotificationsViaAPI();

    // Cleanup listener on unmount
    return () => {
      console.log('🧹 Cleaning up notifications listener');
      unsubscribe();
    };
  }, [currentUser]);

  // Force refresh from Firebase
  const forceRefreshFromFirebase = async () => {
    if (!currentUser) return;
    
    try {
      const notificationsRef = ref(database, `users/${currentUser.uid}/notifications`);
      const snapshot = await get(notificationsRef);
      const data = snapshot.val();
      
      if (!data) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Convert to array and sort by createdAt (newest first)
      let allNotificationsArray = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      })).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      // Calculate unread count
      const unreadNotifications = allNotificationsArray.filter(n => {
        const isRead = isNotificationRead(n);
        
        // Log for debugging
        console.log(`📋 [Force Refresh] Notification ${n.id.substring(0, 8)}...: read = ${JSON.stringify(n.read)} (type: ${typeof n.read}), isRead = ${isRead}`);
        
        return !isRead;
      });
      
      // Filter for display
      const filteredNotifications = filterNotifications(allNotificationsArray);
      
      console.log('🔄 [Force Refresh] Refreshed from Firebase:', {
        total: allNotificationsArray.length,
        unread: unreadNotifications.length,
        readStatuses: allNotificationsArray.map(n => ({ 
          id: n.id.substring(0, 8) + '...', 
          read: n.read, 
          readStringified: JSON.stringify(n.read),
          type: typeof n.read 
        }))
      });
      
      setNotifications(filteredNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error force refreshing from Firebase:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const response = await fetch(
        `${backendUrl}/api/notifications/${currentUser.uid}/all/read`,
        { method: 'PUT' }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to mark all notifications as read');
      }

      const result = await response.json();
      console.log('✅ All notifications marked as read in database:', result);
      console.log(`   Updated count: ${result.updatedCount || 0} notifications`);

      // Wait longer for Firebase to sync, then force refresh multiple times
      // Firebase might need time to propagate the changes
      setTimeout(async () => {
        console.log('🔍 Force refreshing from Firebase after marking as read (attempt 1)...');
        await forceRefreshFromFirebase();
      }, 500);
      
      setTimeout(async () => {
        console.log('🔍 Force refreshing from Firebase after marking as read (attempt 2)...');
        await forceRefreshFromFirebase();
      }, 1000);
      
      setTimeout(async () => {
        console.log('🔍 Force refreshing from Firebase after marking as read (attempt 3)...');
        await forceRefreshFromFirebase();
      }, 2000);
      
      // Optimistically update UI immediately
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // On error, refresh from Firebase to get correct state
      await forceRefreshFromFirebase();
    }
  };

  const clearAllNotifications = async () => {
    if (!currentUser) return;

    try {
      const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const response = await fetch(
        `${backendUrl}/api/notifications/${currentUser.uid}/all`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to clear all notifications');
      }

      const result = await response.json();
      console.log('✅ All notifications cleared:', result);

      // Optimistically update UI immediately
      setNotifications([]);
      setUnreadCount(0);

      // Wait for Firebase to sync, then force refresh multiple times
      setTimeout(async () => {
        console.log('🔍 Force refreshing from Firebase after clearing (attempt 1)...');
        await forceRefreshFromFirebase();
      }, 500);
      
      setTimeout(async () => {
        console.log('🔍 Force refreshing from Firebase after clearing (attempt 2)...');
        await forceRefreshFromFirebase();
      }, 1000);
      
      setTimeout(async () => {
        console.log('🔍 Force refreshing from Firebase after clearing (attempt 3)...');
        await forceRefreshFromFirebase();
      }, 2000);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      // On error, refresh from Firebase to get correct state
      await forceRefreshFromFirebase();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'letter_read':
      case 'letter_reread':
      case 'letter_response':
        return '💌';
      case 'letter_security_access':
        return '🔐';
      case 'date_invitation_rsvp':
        return '💑';
      case 'game_prize':
      case 'game_completion':
        return '🎮';
      case 'letter_pdf_download':
        return '📄';
      case 'voice_message':
        return '🎤';
      default:
        return '🔔';
    }
  };

  // Format notification message
  const formatNotificationMessage = (notification) => {
    // If message is already formatted, use it
    if (notification.message) {
      return notification.message;
    }

    // Format based on type
    switch (notification.type) {
      case 'letter_read':
      case 'letter_reread':
        // Use the message from the notification if available
        if (notification.message) {
          return notification.message;
        }
        // Fallback formatting
        const letterTitle = notification.letterTitle || 'Your Letter';
        if (notification.type === 'letter_reread') {
          return `Your letter "${letterTitle}" is being read again! 💌`;
        }
        return `Your letter "${letterTitle}" has been read! 💌`;
      
      case 'letter_security_access':
        // Use the message from the notification if available
        if (notification.message) {
          return notification.message;
        }
        // Fallback formatting
        const securityLetterTitle = notification.letterTitle || 'Your Letter';
        return `Someone is trying to access your letter "${securityLetterTitle}" 🔐`;
      
      case 'date_invitation_rsvp':
        if (notification.status === 'accepted') {
          const date = notification.date || '';
          const time = notification.time || '';
          const location = notification.location || '';
          const receiverName = notification.receiverName || 'Your loved one';
          
          // Format date
          let formattedDate = date;
          if (date) {
            try {
              const dateObj = new Date(date);
              formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            } catch (e) {
              // Keep original if parsing fails
            }
          }
          
          // Format time
          let formattedTime = time;
          if (time) {
            try {
              const [hours, minutes] = time.split(':');
              const hour = parseInt(hours, 10);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const hour12 = hour % 12 || 12;
              formattedTime = `${hour12}:${minutes} ${ampm}`;
            } catch (e) {
              // Keep original if parsing fails
            }
          }
          
          return `Your date invitation on ${formattedDate} at ${formattedTime} at ${location} was accepted by ${receiverName}`;
        }
        // For declined, don't show generic message - return null to filter it out
        return null;
      
      case 'game_prize':
      case 'game_completion':
        const gameType = notification.gameType || 'game';
        const score = notification.score !== undefined ? notification.score : 'N/A';
        const receiverName = notification.receiverName || 'Your loved one';
        
        // Format game type
        const formattedGameType = gameType === 'quiz' ? 'Quiz Game' : 
                                  gameType === 'memory-match' ? 'Memory Match' : 
                                  gameType;
        
        return `${receiverName} passed the ${formattedGameType} with a score of ${score}`;
      
      case 'letter_response':
        // Use the message from the notification if available
        if (notification.message) {
          return notification.message;
        }
        // Fallback formatting
        const responseLetterTitle = notification.letterTitle || 'Your Letter';
        const responseReceiverName = notification.receiverName || 'Your loved one';
        return `${responseReceiverName} wrote back to your letter "${responseLetterTitle}"! 💌`;
      
      case 'letter_pdf_download':
        // Use the message from the notification if available
        if (notification.message) {
          return notification.message;
        }
        // Fallback formatting
        const pdfLetterTitle = notification.letterTitle || 'Your Letter';
        const pdfReceiverName = notification.receiverName || 'Your loved one';
        return `${pdfReceiverName} downloaded your letter "${pdfLetterTitle}" as PDF! 📄`;
      
      case 'voice_message':
        // Use the message from the notification if available
        if (notification.message) {
          return notification.message;
        }
        // Fallback formatting
        const voiceReceiverName = notification.receiverName || 'Your loved one';
        return `${voiceReceiverName} sent you a voice message! 🎤`;
      
      default:
        // Filter out generic "New notification" messages
        const message = notification.message || '';
        if (message.toLowerCase() === 'new notification' || !message.trim()) {
          return null;
        }
        return message;
    }
  };

  const handleBellClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    
    // Mark all as read when opening dropdown
    if (!showDropdown && unreadCount > 0) {
      markAllAsRead(); // This will immediately update state and hide badge
    }
    
    setShowDropdown(!showDropdown);
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBellClick}
        className="relative p-2 text-white hover:text-rose-200 transition-colors flex items-center justify-center"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown - Rendered via Portal outside header to avoid clipping */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDropdown && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDropdown(false)}
                className="fixed inset-0 z-[90]"
              />

              {/* Dropdown Content - Fixed positioning outside header */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="fixed w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] max-h-96 overflow-hidden flex flex-col"
                style={{ 
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`
                }}
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-serif font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-rose-500 font-medium">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Loading...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">🔔</div>
                      <p className="text-sm font-serif">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications
                        .filter((notification) => {
                          const message = formatNotificationMessage(notification);
                          return message && message.trim() !== '';
                        })
                        .map((notification) => {
                          const message = formatNotificationMessage(notification);
                          if (!message || message.trim() === '') return null;
                          
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 hover:bg-gray-50 transition-colors ${
                                !notification.read ? 'bg-rose-50/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                                    <span className="text-xl">{getNotificationIcon(notification)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-serif text-gray-800">
                                    {message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatTime(notification.createdAt || notification.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Footer with Clear Button */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearAllNotifications}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-serif font-medium transition-all"
                    >
                      Clear All
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
