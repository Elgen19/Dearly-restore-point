// MyLetters.jsx - View and manage all letters created by the sender
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ScrollUnravelPreview from '../components/ScrollUnravelPreview';
import LinkGeneratedPage from '../components/LinkGeneratedPage';
import MessageModal from '../components/MessageModal.jsx';

export default function MyLetters({ receiverData, onBack, onCreateLetter }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('sent'); // 'sent' or 'responses'
  const [letters, setLetters] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [userFirstName, setUserFirstName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [regeneratingToken, setRegeneratingToken] = useState(false);
  const [showRegenerateLinkModal, setShowRegenerateLinkModal] = useState(false);
  const [regeneratedLink, setRegeneratedLink] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingScheduledLetter, setEditingScheduledLetter] = useState(null);
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editScheduledTime, setEditScheduledTime] = useState('');
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [scheduleUpdateModal, setScheduleUpdateModal] = useState({ isOpen: false, message: '', type: 'success' });

  // Fetch letters and responses when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchLetters();
      fetchResponses();
      fetchUserFirstName();
    }
  }, [currentUser]);

  // Fetch responses on mount
  useEffect(() => {
    if (currentUser) {
      fetchResponses();
    }
  }, [currentUser]);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for real-time countdown

    return () => clearInterval(interval);
  }, []);

  // Fetch user's first name
  const fetchUserFirstName = async () => {
    if (!currentUser) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/auth/check-verification/${currentUser.uid}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user && result.user.firstName) {
          setUserFirstName(result.user.firstName);
          return;
        }
      }
    } catch (error) {
      console.log('Could not fetch user profile, using fallback');
    }

    // Fallback: try to get from currentUser.displayName or email
    if (currentUser.displayName) {
      const getFirstName = (fullName) => {
        if (!fullName) return "";
        return fullName.trim().split(/\s+/)[0];
      };
      setUserFirstName(getFirstName(currentUser.displayName));
    } else if (currentUser.email) {
      const emailName = currentUser.email.split('@')[0];
      const getFirstName = (fullName) => {
        if (!fullName) return "";
        return fullName.trim().split(/\s+/)[0];
      };
      setUserFirstName(getFirstName(emailName));
    }
  };

  const fetchLetters = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/letters/${currentUser.uid}`);

      if (!response.ok) {
        if (response.status === 404) {
          // No letters yet
          setLetters([]);
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to fetch letters: ${response.status}`);
      }

      const data = await response.json();
      setLetters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching letters:', err);
      setError(err.message || 'Failed to load letters. Please try again later.');
      setLetters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponses = async () => {
    if (!currentUser) return;

    try {
      setError(null);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const lettersResponse = await fetch(`${backendUrl}/api/letters/${currentUser.uid}`);

      if (!lettersResponse.ok) {
        console.error('Failed to fetch letters for responses:', lettersResponse.status);
        setResponses([]);
        return;
      }

      const lettersData = await lettersResponse.json();
      const lettersArray = Array.isArray(lettersData) ? lettersData : [];

      const allResponses = [];

      lettersArray.forEach((letter) => {
        if (letter.responses) {
          Object.entries(letter.responses).forEach(([responseId, responseData]) => {
            allResponses.push({
              id: responseId,
              ...responseData,
              letterId: letter.id,
              letterTitle: letter.introductory || letter.title || 'Untitled Letter',
              letterCreatedAt: letter.createdAt,
            });
          });
        }
      });

      allResponses.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setResponses(allResponses);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError(err.message || 'Failed to load responses. Please try again later.');
      setResponses([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'read') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          ✓ Read
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
        ● Unread
      </span>
    );
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return 'No content';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleViewLetter = (letter) => {
    setSelectedLetter(letter);
    setSelectedResponse(null);
    setEditContent(letter.mainBody || '');
    setEditTitle(letter.introductory || 'Untitled Letter');
    setIsEditing(false);
    setShowPreview(false);
  };

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
    setSelectedLetter(null);
    setIsEditing(false);
    setShowPreview(false);
  };

  const handleCloseDetail = () => {
    setSelectedLetter(null);
    setSelectedResponse(null);
    setIsEditing(false);
    setEditContent('');
    setEditTitle('');
    setShowPreview(false);
    setShowEmailModal(false);
    setEmailSent(false);
    setEmailError('');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLetter || !currentUser) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/letters/${currentUser.uid}/${selectedLetter.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete letter');
      }

      // Small delay for animation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove the letter from the local state
      setLetters(letters.filter(l => l.id !== selectedLetter.id));
      handleCloseDetail();
    } catch (err) {
      console.error('Error deleting letter:', err);
      alert('Failed to delete letter. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleUpdateScheduledDateTime = async () => {
    if (!editingScheduledLetter || !editScheduledDate || !editScheduledTime || !currentUser) return;

    try {
      setIsUpdatingSchedule(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Combine date and time into ISO string
      // Create date string in format YYYY-MM-DDTHH:mm:00 (local time)
      const dateTimeString = `${editScheduledDate}T${editScheduledTime}:00`;
      // Create Date object - this will interpret as local time
      const scheduledDateTime = new Date(dateTimeString);
      
      // Validate that the scheduled time is in the future
      if (scheduledDateTime <= new Date()) {
        setScheduleUpdateModal({ isOpen: true, message: 'Scheduled date and time must be in the future', type: 'warning' });
        setIsUpdatingSchedule(false);
        return;
      }

      const response = await fetch(`${backendUrl}/api/letters/${currentUser.uid}/${editingScheduledLetter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledDateTime: scheduledDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update scheduled date/time');
      }

      // Refresh letters to get updated data
      await fetchLetters();
      
      // Close the edit modal
      setEditingScheduledLetter(null);
      setEditScheduledDate('');
      setEditScheduledTime('');
      
      // Show success message
      setScheduleUpdateModal({ isOpen: true, message: 'Scheduled date and time updated successfully! 💕', type: 'success' });
    } catch (error) {
      console.error('Error updating scheduled date/time:', error);
      setScheduleUpdateModal({ isOpen: true, message: 'Failed to update scheduled date/time. Please try again.', type: 'error' });
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedLetter || !currentUser) return;

    setIsSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/letters/${currentUser.uid}/${selectedLetter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainBody: editContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update letter');
      }

      // Update the letter in the local state
      setLetters(letters.map(l => 
        l.id === selectedLetter.id 
          ? { ...l, mainBody: editContent.trim(), updatedAt: new Date().toISOString() }
          : l
      ));

      // Update selected letter
      setSelectedLetter({ ...selectedLetter, mainBody: editContent.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating letter:', err);
      alert('Failed to update letter. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedLetter) {
      setEditContent(selectedLetter.mainBody || '');
      setEditTitle(selectedLetter.introductory || 'Untitled Letter');
    }
    setIsEditing(false);
  };

  const handleRegenerateToken = async () => {
    if (!selectedLetter || !currentUser) return;

    setRegeneratingToken(true);
    try {
      // Get Firebase ID token for authentication
      const idToken = await currentUser.getIdToken();
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/letters/${currentUser.uid}/${selectedLetter.id}/regenerate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // ✅ Send auth token
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to regenerate token');
      }

      const result = await response.json();
      
      // Construct full URL on frontend (same as letter creation)
      const baseUrl = window.location.origin;
      const shareableLink = `${baseUrl}${result.shareableLink}`;
      
      // Update the selected letter with new token and link
      const updatedLetter = {
        ...selectedLetter,
        accessToken: result.token,
        shareableLink: shareableLink
      };
      setSelectedLetter(updatedLetter);

      // Update the letter in the letters list
      setLetters(letters.map(l => 
        l.id === selectedLetter.id 
          ? { ...l, accessToken: result.token, shareableLink: shareableLink }
          : l
      ));

      // Show the beautiful link generated modal instead of alert
      setRegeneratedLink(shareableLink);
      setShowRegenerateLinkModal(true);
    } catch (err) {
      console.error('Error regenerating token:', err);
      alert(err.message || 'Failed to regenerate token. Please try again.');
    } finally {
      setRegeneratingToken(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedLetter || !currentUser) return;
    
    if (!emailAddress || !emailAddress.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    setEmailError('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Send email
      const emailResponse = await fetch(`${backendUrl}/api/letter-email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: emailAddress,
          recipientName: receiverData?.name || 'there',
          senderName: userFirstName || 'Someone special',
          shareableLink: selectedLetter.shareableLink,
          letterTitle: selectedLetter.introductory || 'A special letter for you',
        }),
      });

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        // Update the letter to mark email as sent
        const updateResponse = await fetch(`${backendUrl}/api/letters/${currentUser.uid}/${selectedLetter.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailSent: true,
            emailSentTo: emailAddress,
          }),
        });

        if (updateResponse.ok) {
          // Update local state
          setLetters(letters.map(l => 
            l.id === selectedLetter.id 
              ? { ...l, emailSent: true, emailSentTo: emailAddress, emailSentAt: new Date().toISOString() }
              : l
          ));
          setSelectedLetter({ ...selectedLetter, emailSent: true, emailSentTo: emailAddress, emailSentAt: new Date().toISOString() });
        }

        setEmailSent(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSent(false);
          setEmailAddress('');
        }, 3000);
      } else {
        setEmailError(emailResult.error || 'Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send email. Please check your connection and try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-pink-300/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 30}px`,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          >
            💕
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative p-6 md:p-8 overflow-hidden"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(135deg, rgb(244, 63, 94) 0%, rgb(236, 72, 153) 50%, rgb(168, 85, 247) 100%)',
                'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(168, 85, 247) 50%, rgb(244, 63, 94) 100%)',
                'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(244, 63, 94) 50%, rgb(236, 72, 153) 100%)',
                'linear-gradient(135deg, rgb(244, 63, 94) 0%, rgb(236, 72, 153) 50%, rgb(168, 85, 247) 100%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Animated Gradient Overlay for Depth */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Floating Gradient Orbs */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                width: `${300 + i * 100}px`,
                height: `${300 + i * 100}px`,
                background: i % 2 === 0
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(244, 63, 94, 0.3))'
                  : 'radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(168, 85, 247, 0.3))',
              }}
              animate={{
                x: [0, 100, -100, 0],
                y: [0, -100, 100, 0],
                scale: [1, 1.2, 0.8, 1],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Twinkling Stars/Sparkles */}
          {[...Array(25)].map((_, i) => {
            const size = Math.random() < 0.6 ? 3 : Math.random() < 0.8 ? 4 : 5;
            return (
              <motion.div
                key={`twinkle-${i}`}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                animate={{
                  opacity: [0, 1, 0.3, 1, 0],
                  scale: [0, 1.2, 0.8, 1.5, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
              >
                <svg
                  width={size}
                  height={size}
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
                    fill="white"
                    opacity="0.9"
                  />
                </svg>
              </motion.div>
            );
          })}

          <div className="relative max-w-7xl mx-auto px-3 sm:px-4">
            {/* Mobile Layout: Back button, title, and subheader in same row */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
                {/* Back Button */}
                <motion.button
                  onClick={onBack}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white shadow-lg flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                {/* Title and Subheader centered */}
                <div className="text-center flex-1 px-2">
                  <h1 className="text-xl font-serif font-bold text-white drop-shadow mb-0.5 flex items-center justify-center gap-1.5">
                    My Letters
                    <motion.span
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="inline-block"
                    >
                      💌
                    </motion.span>
                  </h1>
                  <p className="text-white/90 font-serif text-xs">
                    {receiverData?.name ? `Letters for ${receiverData.name}` : 'Your heartfelt letters'}
                  </p>
                </div>
                {/* Spacer to balance layout */}
                <div className="w-9"></div>
              </div>
            </div>

            {/* Desktop Layout: Horizontal */}
            <div className="hidden md:flex items-center justify-between">
              {/* Back Button */}
              <motion.button
                onClick={onBack}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              {/* Title centered */}
              <div className="text-center">
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow mb-2 flex items-center justify-center gap-2">
                  My Letters
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="inline-block"
                  >
                    💌
                  </motion.span>
                </h1>
                <p className="text-white/90 font-serif">
                  {receiverData?.name ? `Letters for ${receiverData.name}` : 'Your heartfelt letters'}
                </p>
              </div>

              {/* Create New Letter Button */}
              <div className="flex items-center gap-3">
                {!isLoading && !error && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCreateLetter}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-serif font-semibold shadow-lg"
                  >
                    Create Letter
                  </motion.button>
                )}
              </div>
            </div>

          </div>
        </motion.div>

        {/* Decorative wave */}
        <svg
          className="w-full h-12 md:h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
            fill="rgb(254, 242, 242)"
          />
        </svg>

      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-4 pb-6 sm:pb-8 md:pb-12 relative z-10">

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600 font-serif">Loading your letters...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <p className="text-red-700 font-serif">{error}</p>
            <button
              onClick={fetchLetters}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium underline"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Empty State - Only show if no letters exist at all */}
        {!isLoading && !error && letters.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 sm:py-12 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-rose-200 mb-8 sm:mb-12 px-4"
        >
            <div className="text-4xl sm:text-6xl mb-4">💌</div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-800 mb-2">
              No letters yet
            </h3>
            <p className="text-gray-600 font-serif text-sm sm:text-base mb-6">
              Start expressing your heart by creating your first letter
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(244, 63, 94, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateLetter}
              className="relative px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold text-base shadow-lg overflow-hidden group"
            >
              {/* Running light shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💌
                </motion.span>
                Create Your First Letter
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* Letters Sent Out Section - Only show if there are sent letters (not scheduled) */}
        {!isLoading && !error && (() => {
          // Filter out scheduled letters - only show letters that have been sent
          const sentLetters = letters.filter(letter => {
            // Exclude letters that are scheduled (not yet sent)
            const isScheduled = letter.emailScheduled === true || letter.emailScheduled === 'true' || letter.emailScheduled === 1;
            const hasScheduledDateTime = letter.scheduledDateTime;
            
            // If it's scheduled and not yet sent, exclude it
            if (isScheduled && hasScheduledDateTime) {
              try {
                const scheduledDate = new Date(letter.scheduledDateTime);
                const now = new Date();
                // If scheduled date is in the future, exclude it
                if (!isNaN(scheduledDate.getTime()) && scheduledDate > now) {
                  return false;
                }
              } catch (error) {
                // If date parsing fails, exclude it to be safe
                return false;
              }
            }
            
            // Include letters that have been sent or don't have scheduling
            return true;
          });

          // Only show this section if there are sent letters
          if (sentLetters.length === 0) return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 mt-2"
            >
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-800">
                  📤 Letters Sent Out
                </h2>
              </div>

              {/* Letters List - Horizontal Scroll */}
              {sentLetters.length > 0 && (
                <div className="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`
                    .overflow-x-auto::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="flex gap-4 sm:gap-6" style={{ width: 'max-content' }}>
                <AnimatePresence>
                  {sentLetters.map((letter, index) => (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => handleViewLetter(letter)}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-transparent hover:border-rose-200 transition-all cursor-pointer flex-shrink-0 w-[280px] sm:w-[350px] min-w-[280px] sm:min-w-[350px]"
                >
                  {/* Letter Header */}
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-800 mb-1 truncate">
                        {letter.introductory || 'Untitled Letter'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-serif">
                        {formatDate(letter.createdAt)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(letter.status)}
                    </div>
                  </div>

                  {/* Letter Preview */}
                  <p className="text-gray-600 font-serif text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-4">
                    {truncateContent(letter.mainBody, 100)}
                  </p>

                  {/* Letter Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      {letter.emailSent && (
                        <span className="text-xs text-blue-600 font-serif flex items-center gap-1">
                          📧 Sent
                        </span>
                      )}
                      {letter.readAt && (
                        <p className="text-xs text-gray-500 font-serif">
                          Read {formatDate(letter.readAt)}
                        </p>
                      )}
                      {!letter.readAt && !letter.emailSent && (
                        <p className="text-xs text-yellow-600 font-serif">
                          Waiting to be read
                        </p>
                      )}
                    </div>
                    <div className="text-rose-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
              </div>
            </div>
          )}
          
          {/* Create Letter Button - Mobile only, below cards */}
          <div className="md:hidden mt-4 -mx-4 sm:-mx-0 px-4 sm:px-0">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateLetter}
              className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-full font-serif font-semibold text-sm shadow-lg"
            >
              Create Letter
            </motion.button>
          </div>
            </motion.div>
          );
        })()}

        {/* Scheduled Letters Section - Only show if there are scheduled letters */}
        {!isLoading && !error && (() => {
          const scheduledLetters = letters.filter(letter => {
            // Check if letter has scheduling info - be flexible with data types
            const hasScheduled = letter.emailScheduled === true || letter.emailScheduled === 'true' || letter.emailScheduled === 1;
            const hasScheduledDateTime = letter.scheduledDateTime;
            
            if (!hasScheduled || !hasScheduledDateTime) {
              return false;
            }
            
            try {
              const scheduledDate = new Date(letter.scheduledDateTime);
              const now = new Date();
              
              // Check if date is valid
              if (isNaN(scheduledDate.getTime())) {
                return false;
              }
              
              // Show letters scheduled for the future
              // Don't show if emailSent is true (already sent)
              const isFuture = scheduledDate > now;
              const notYetSent = !letter.emailSent;
              
              return isFuture && notYetSent;
            } catch (error) {
              console.error('Error parsing scheduled date for letter:', letter.id, error);
              return false;
            }
          });

          if (scheduledLetters.length === 0) return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-12"
            >
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-800">
                  📅 Scheduled Letters
                </h2>
              </div>

              {/* Scheduled Letters List - Horizontal Scroll */}
              <div className="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                  .overflow-x-auto::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="flex gap-4 sm:gap-6" style={{ width: 'max-content' }}>
                  <AnimatePresence>
                    {scheduledLetters.map((letter, index) => {
                      const scheduledDate = new Date(letter.scheduledDateTime);
                      const timeUntil = scheduledDate.getTime() - currentTime.getTime();
                      const daysUntil = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
                      const hoursUntil = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

                      return (
                        <motion.div
                          key={letter.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          onClick={() => handleViewLetter(letter)}
                          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-blue-200 hover:border-blue-300 transition-all cursor-pointer flex-shrink-0 w-[280px] sm:w-[350px] min-w-[280px] sm:min-w-[350px]"
                        >
                          {/* Letter Header */}
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-800 mb-1 truncate">
                                {letter.introductory || 'Untitled Letter'}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500 font-serif">
                                Created {formatDate(letter.createdAt)}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                                📅 Scheduled
                              </span>
                            </div>
                          </div>

                          {/* Scheduled Info */}
                          <div className="bg-white/60 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 border border-blue-200">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-base sm:text-lg flex-shrink-0">📧</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 font-serif mb-1">Sending to:</p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-800 font-serif truncate">
                                  {receiverData?.email || letter.emailSentTo || 'Not specified'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-base sm:text-lg flex-shrink-0">⏰</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 font-serif mb-1">Scheduled for:</p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-800 font-serif">
                                  {scheduledDate.toLocaleString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                                <p className="text-xs text-blue-600 font-serif mt-1">
                                  {daysUntil > 0 
                                    ? `${daysUntil} day${daysUntil > 1 ? 's' : ''} and ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`
                                    : hoursUntil > 0
                                    ? `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''} and ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`
                                    : `${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`
                                  } until send
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Letter Preview */}
                          <p className="text-gray-600 font-serif text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                            {truncateContent(letter.mainBody, 100)}
                          </p>

                          {/* Letter Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-xs text-blue-600 font-serif flex items-center gap-1">
                              <span>📅</span>
                              Scheduled
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const scheduledDate = new Date(letter.scheduledDateTime);
                                // Get date in local timezone for date input (YYYY-MM-DD)
                                const year = scheduledDate.getFullYear();
                                const month = String(scheduledDate.getMonth() + 1).padStart(2, '0');
                                const day = String(scheduledDate.getDate()).padStart(2, '0');
                                setEditScheduledDate(`${year}-${month}-${day}`);
                                // Get time in local timezone for time input (HH:mm)
                                const hours = String(scheduledDate.getHours()).padStart(2, '0');
                                const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
                                setEditScheduledTime(`${hours}:${minutes}`);
                                setEditingScheduledLetter(letter);
                              }}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1 whitespace-nowrap"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Time
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Write Backs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-800 mb-4 sm:mb-6">
            📥 Letters Received as Write Back
          </h2>
          
          {/* Empty State for Responses */}
          {!isLoading && !error && responses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 sm:py-12 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-rose-200 px-4"
            >
              <div className="text-4xl sm:text-6xl mb-4">💌</div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-800 mb-2">
                No responses yet
              </h3>
              <p className="text-gray-600 font-serif text-sm sm:text-base mb-6">
                Responses from your letters will appear here when they reply
              </p>
            </motion.div>
          )}

          {/* Responses List - Horizontal Scroll */}
          {!isLoading && !error && responses.length > 0 && (
            <div className="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                .overflow-x-auto::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex gap-4 sm:gap-6" style={{ width: 'max-content' }}>
                <AnimatePresence>
                  {responses.map((response, index) => (
                    <motion.div
                      key={`response-${response.letterId}-${response.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => {
                        setSelectedResponse(response);
                        setSelectedLetter(null);
                        setShowPreview(true);
                      }}
                      className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-transparent hover:border-pink-200 transition-all cursor-pointer flex-shrink-0 w-[280px] sm:w-[350px] min-w-[280px] sm:min-w-[350px]"
                    >
                  {/* Response Header */}
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-800 mb-1">
                        Response to: {response.letterTitle || 'Your Letter'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-serif">
                        From: {response.receiverName || 'Friend'}
                      </p>
                      <p className="text-xs text-gray-400 font-serif mt-1">
                        {formatDate(response.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Response Preview */}
                  <p className="text-gray-600 font-serif text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-4">
                    {truncateContent(response.content, 100)}
                  </p>

                  {/* Response Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 font-serif">
                      Response
                    </div>
                    <div className="text-pink-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                    </motion.div>
                  ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
        </motion.div>

        {/* Summary Stats for Letters Sent */}
        {!isLoading && !error && letters.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 sm:mt-8 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-rose-200"
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <span className="text-xl sm:text-3xl">💌</span>
                  <div className="text-xl sm:text-3xl font-serif font-bold text-gray-800">
                    {letters.length}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-serif">Total Letters</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <span className="text-xl sm:text-3xl">✓</span>
                  <div className="text-xl sm:text-3xl font-serif font-bold text-green-600">
                    {letters.filter(l => l.status === 'read').length}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-serif">Read</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <span className="text-xl sm:text-3xl">●</span>
                  <div className="text-xl sm:text-3xl font-serif font-bold text-yellow-600">
                    {letters.filter(l => l.status === 'unread' || !l.status).length}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-serif">Unread</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Letter Detail Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] md:max-h-[90vh] h-[100vh] md:h-auto flex flex-col m-0 md:m-4"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-serif font-bold text-white truncate">
                      {selectedLetter.introductory || 'Untitled Letter'}
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm font-serif mt-1">
                      {formatDate(selectedLetter.createdAt)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseDetail}
                    className="ml-2 sm:ml-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all flex-shrink-0"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col min-h-0">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full min-h-[200px] sm:min-h-[400px] p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl font-serif text-sm sm:text-base text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    placeholder="Write your letter here..."
                  />
                ) : showPreview ? (
                  <div className="flex-1 min-h-[300px] sm:min-h-[500px] h-full bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl p-2 sm:p-4 border-2 border-rose-100 overflow-hidden flex flex-col">
                    <ScrollUnravelPreview 
                      key={`preview-${selectedLetter.id}-${showPreview}`}
                      letterContent={selectedLetter.mainBody || ''} 
                      userFirstName={userFirstName}
                      letterTitle={selectedLetter.introductory || 'Untitled Letter'}
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 sm:p-6 border-2 border-rose-100 overflow-y-auto">
                    <p className="text-gray-700 font-serif text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {selectedLetter.mainBody || ''}
                    </p>
                  </div>
                )}

                {/* Letter Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 md:gap-4 text-sm">
                    {getStatusBadge(selectedLetter.status)}
                    {selectedLetter.emailSent && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full font-serif flex items-center gap-1 w-fit">
                        📧 Sent to {selectedLetter.emailSentTo || 'recipient'}
                      </span>
                    )}
                    {selectedLetter.readAt && (
                      <span className="text-gray-500 font-serif">
                        Read on {formatDate(selectedLetter.readAt)}
                      </span>
                    )}
                    {!selectedLetter.readAt && (
                      <span className="text-yellow-600 font-serif">
                        Waiting to be read
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
                {isEditing ? (
                  <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-4 sm:px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-serif text-xs sm:text-sm transition-all disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveEdit}
                      disabled={isSaving || !editContent.trim()}
                      className="px-4 sm:px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg font-serif font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Main Body'}</span>
                      <span className="sm:hidden">{isSaving ? 'Saving...' : 'Save'}</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Sharing Actions Group */}
                    {selectedLetter.shareableLink && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:flex-wrap">
                        <span className="text-xs font-serif text-gray-500 uppercase tracking-wide sm:mr-2">Share:</span>
                        
                        {/* Send Email Button - Only show if email wasn't sent initially */}
                        {!selectedLetter.emailSent && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEmailAddress(receiverData?.email || '');
                              setShowEmailModal(true);
                              setEmailError('');
                            }}
                            className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-serif text-xs sm:text-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send Email
                          </motion.button>
                        )}
                        
                        {/* Regenerate Token Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleRegenerateToken}
                          disabled={regeneratingToken}
                          className="px-3 sm:px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-serif text-xs sm:text-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                          title="Regenerate token to extend expiration or create a new link"
                        >
                          {regeneratingToken ? (
                            <>
                              <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="hidden sm:inline">Regenerating...</span>
                              <span className="sm:hidden">Regenerating...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span className="hidden sm:inline">Regenerate Link</span>
                              <span className="sm:hidden">Regenerate</span>
                            </>
                          )}
                        </motion.button>
                        
                        {/* Open Link / Preview Button */}
                        {!showPreview ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              // If shareableLink exists, open it in a new tab with preview parameter
                              if (selectedLetter.shareableLink) {
                                console.log('🔗 MyLetters: Opening link:', { 
                                  shareableLink: selectedLetter.shareableLink,
                                  origin: window.location.origin,
                                  accessToken: selectedLetter.accessToken
                                });
                                
                                // Construct full URL
                                let fullUrl;
                                if (selectedLetter.shareableLink.startsWith('http')) {
                                  // Already a full URL
                                  fullUrl = new URL(selectedLetter.shareableLink);
                                } else {
                                  // Relative path, construct full URL
                                  fullUrl = new URL(selectedLetter.shareableLink, window.location.origin);
                                }
                                
                                // Add preview parameter
                                fullUrl.searchParams.set('preview', 'true');
                                
                                console.log('🔗 MyLetters: Final URL:', fullUrl.toString());
                                window.open(fullUrl.toString(), '_blank');
                              } else {
                                // Fallback to preview mode if no link
                                setShowPreview(true);
                              }
                            }}
                            className="px-3 sm:px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-serif text-xs sm:text-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {selectedLetter.shareableLink ? 'Open Link' : 'Preview'}
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowPreview(false)}
                            className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-serif text-xs sm:text-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            View Text
                          </motion.button>
                        )}
                      </div>
                    )}

                    {/* Content Actions Group */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-2 border-t border-gray-100">
                      <span className="text-xs font-serif text-gray-500 uppercase tracking-wide sm:mr-2 hidden sm:inline">Actions:</span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-serif text-gray-500 uppercase tracking-wide sm:hidden">Actions:</span>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleEdit}
                          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-serif text-xs sm:text-sm font-semibold shadow-lg transition-all flex items-center gap-2 flex-1 sm:flex-initial justify-center"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDeleteClick}
                          disabled={isDeleting}
                          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full font-serif text-xs sm:text-sm font-semibold shadow-lg transition-all flex items-center gap-2 flex-1 sm:flex-initial justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </motion.button>
                      </div>
                      
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Detail Modal - Full Page Preview */}
      <AnimatePresence>
        {selectedResponse && showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowPreview(false);
                setSelectedResponse(null);
              }}
              className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg"
              aria-label="Close preview"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Full Page Scroll Preview */}
            <div className="w-full h-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                .scroll-preview-container *::-webkit-scrollbar {
                  display: none;
                }
                .scroll-preview-container * {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              <div className="scroll-preview-container w-full h-full">
                <ScrollUnravelPreview 
                  key={`response-preview-${selectedResponse.id}`}
                  letterContent={selectedResponse.content || ''} 
                  userFirstName={userFirstName}
                  letterTitle={`Response from ${selectedResponse.receiverName || 'Friend'}`}
                  autoLoop={false}
                  showTitleOpener={false}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={handleDeleteCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
                >
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                  Delete Letter?
                </h3>
                <p className="text-gray-600 font-serif text-sm">
                  Are you sure you want to delete this letter? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-serif text-sm font-medium transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-serif text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deletion Loading Overlay */}
      <AnimatePresence>
        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full"
                />
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">
                  Deleting Letter...
                </h3>
                <p className="text-gray-600 font-serif text-sm">
                  Please wait while we delete your letter
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={() => !sendingEmail && !emailSent && setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              {!emailSent ? (
                <>
                  <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2 text-center">
                    📧 Send Letter via Email
                  </h3>
                  <p className="text-gray-600 font-serif text-sm text-center mb-6">
                    Enter the recipient's email address to send them the letter link
                  </p>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-serif text-sm mb-2">
                      Recipient Email:
                    </label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => {
                        setEmailAddress(e.target.value);
                        setEmailError('');
                      }}
                      placeholder="recipient@example.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                      disabled={sendingEmail}
                    />
                    {emailError && (
                      <p className="text-red-500 text-sm mt-2 font-serif">{emailError}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowEmailModal(false);
                        setEmailError('');
                        setEmailAddress('');
                      }}
                      disabled={sendingEmail}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-serif font-semibold transition-all disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !emailAddress}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-serif font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        'Send Email'
                      )}
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-6xl mb-4"
                  >
                    ✅
                  </motion.div>
                  <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                    Email Sent!
                  </h3>
                  <p className="text-gray-600 font-serif text-sm">
                    Your letter link has been sent to {emailAddress}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regenerate Link Modal */}
      <AnimatePresence>
        {showRegenerateLinkModal && regeneratedLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm"
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-2xl"
              >
                <LinkGeneratedPage
                  shareableLink={regeneratedLink}
                  onContinue={() => {
                    setShowRegenerateLinkModal(false);
                    setRegeneratedLink(null);
                  }}
                  receiverEmail={receiverData?.email || ''}
                  receiverName={receiverData?.name || ''}
                  letterTitle={selectedLetter?.introductory || 'Your Letter'}
                  letterId={selectedLetter?.id}
                  userId={currentUser?.uid}
                />
                {/* Close button overlay */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowRegenerateLinkModal(false);
                    setRegeneratedLink(null);
                  }}
                  className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Scheduled Date/Time Modal */}
      {editingScheduledLetter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (!isUpdatingSchedule) {
              setEditingScheduledLetter(null);
              setEditScheduledDate('');
              setEditScheduledTime('');
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4">
              Edit Scheduled Date & Time
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-serif text-gray-600 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editScheduledDate}
                  onChange={(e) => setEditScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
                  disabled={isUpdatingSchedule}
                />
              </div>
              
              <div>
                <label className="block text-sm font-serif text-gray-600 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={editScheduledTime}
                  onChange={(e) => setEditScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
                  disabled={isUpdatingSchedule}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!isUpdatingSchedule) {
                    setEditingScheduledLetter(null);
                    setEditScheduledDate('');
                    setEditScheduledTime('');
                  }
                }}
                disabled={isUpdatingSchedule}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-serif font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateScheduledDateTime}
                disabled={isUpdatingSchedule || !editScheduledDate || !editScheduledTime}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-serif font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingSchedule ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Updating...
                  </>
                ) : (
                  'Update Schedule'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Schedule Update Message Modal */}
      <MessageModal
        isOpen={scheduleUpdateModal.isOpen}
        onClose={() => setScheduleUpdateModal({ isOpen: false, message: '', type: 'success' })}
        message={scheduleUpdateModal.message}
        type={scheduleUpdateModal.type}
      />
    </div>
  );
}

