// ReceiverMode.jsx - Receiver mode interface showing received letters and options
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import RoleSwitcher from '../components/RoleSwitcher';
import OptionsPage from './OptionsPage';

export default function ReceiverMode({ onSwitchToSender }) {
  const { currentUser } = useAuth();
  const [receivedLetters, setReceivedLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showOptionsPage, setShowOptionsPage] = useState(false);

  // Fetch received letters for the current user
  useEffect(() => {
    const fetchReceivedLetters = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        // Fetch letters where this user is the receiver
        const response = await fetch(`${backendUrl}/api/receiver-accounts/letters/${currentUser.uid}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setReceivedLetters(result.letters || []);
          }
        }
      } catch (error) {
        console.error('Error fetching received letters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivedLetters();
  }, [currentUser]);

  // If a letter is selected, show OptionsPage
  if (showOptionsPage && selectedLetter) {
    // Construct full letter content from letter parts
    const letterContent = selectedLetter.mainBody || 
      (selectedLetter.content || `${selectedLetter.introductory || ''}\n\n${selectedLetter.mainBody || ''}\n\n${selectedLetter.closing || ''}`);
    
    return (
      <OptionsPage
        letterContent={letterContent}
        receiverName={selectedLetter.receiverName || currentUser?.email?.split('@')[0] || "Friend"}
        userId={selectedLetter.senderUserId}
        letterId={selectedLetter.id}
        token={selectedLetter.token || selectedLetter.originalToken}
        receiverEmail={currentUser?.email || ''}
        senderUserId={selectedLetter.senderUserId}
        dashboardMusic={selectedLetter.dashboardMusic || []}
        onViewAllLetters={() => {
          setShowOptionsPage(false);
          setSelectedLetter(null);
        }}
        onBack={() => {
          setShowOptionsPage(false);
          setSelectedLetter(null);
        }}
      />
    );
  }

  // Memoize background elements
  const backgroundHearts = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      fontSize: 20 + Math.random() * 40,
      duration: 8 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {backgroundHearts.map((heart) => (
          <motion.div
            key={`heart-${heart.id}`}
            className="absolute text-pink-300/20"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              fontSize: `${heart.fontSize}px`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: heart.duration,
              repeat: Infinity,
              delay: heart.delay,
              ease: "easeInOut",
            }}
          >
            💕
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 w-full z-50 overflow-hidden shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative py-6 md:py-8 px-4 md:px-8"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(135deg, rgb(244, 63, 94) 0%, rgb(236, 72, 153) 50%, rgb(168, 85, 247) 100%)',
                'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(168, 85, 247) 50%, rgb(244, 63, 94) 100%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex-shrink-0"
            >
              <img 
                src="/dearly-logo.svg" 
                alt="Dearly" 
                className="h-10 md:h-12 lg:h-14 w-auto drop-shadow-lg"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.div>

            {/* Centered Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col items-center justify-center text-center absolute left-1/2 transform -translate-x-1/2"
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow-lg mb-1">
                Received Letters
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
                  className="inline-block ml-2"
                >
                  💌
                </motion.span>
              </h1>
              <p className="text-white/90 text-sm md:text-base lg:text-lg font-serif italic drop-shadow-md">
                Letters sent to you
              </p>
            </motion.div>

            {/* Role Switcher */}
            <div className="flex items-center gap-3">
              <RoleSwitcher 
                currentRole="receiver" 
                onRoleChange={(role) => {
                  if (role === 'sender') {
                    onSwitchToSender();
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        {isLoading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4 inline-block"
            >
              💕
            </motion.div>
            <p className="text-gray-600 font-serif text-lg">Loading your letters...</p>
          </div>
        ) : receivedLetters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
              No letters yet
            </h2>
            <p className="text-gray-600 font-serif">
              Letters you receive will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivedLetters.map((letter, index) => (
              <motion.div
                key={letter.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => {
                  setSelectedLetter(letter);
                  setShowOptionsPage(true);
                }}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-rose-200"
              >
                <div className="text-4xl mb-3">💌</div>
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">
                  {letter.title || letter.introductory?.substring(0, 30) || 'Letter'}
                </h3>
                {letter.createdAt && (
                  <p className="text-gray-500 font-serif text-sm mb-4">
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </p>
                )}
                <p className="text-gray-600 font-serif text-sm line-clamp-2">
                  {letter.introductory || letter.content?.substring(0, 100) || 'Click to view options...'}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

