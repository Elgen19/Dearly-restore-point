// Dashboard.jsx - Main dashboard with personalized theme and navigation cards
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import MyLetters from './MyLetters';
import ProfileModal from './ProfileModal';
import NotificationBell from '../components/NotificationBell';
import DatePlanning from './DatePlanning';
import Games from './Games';
import { DashboardMusicProvider } from '../contexts/DashboardMusicContext';

export default function Dashboard({ receiverData, onNavigateToLetters, onNavigateToDatePlanning, onReceiverUpdate, initialShowMyLetters = false, onMyLettersClose }) {
  const { currentUser } = useAuth();
  const [showMyLetters, setShowMyLetters] = useState(initialShowMyLetters);
  
  // Dashboard is always in sender mode - receivers access via token links
  
  // Update showMyLetters when initialShowMyLetters changes
  // Only show MyLetters if explicitly requested (initialShowMyLetters is true)
  useEffect(() => {
    if (initialShowMyLetters) {
      setShowMyLetters(true);
    } else {
      // Ensure MyLetters is closed if initialShowMyLetters is false
      setShowMyLetters(false);
    }
  }, [initialShowMyLetters]);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDatePlanning, setShowDatePlanning] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [userFirstName, setUserFirstName] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Handle navigation to letter craft - reset MyLetters view first
  const handleNavigateToLetters = () => {
    setShowMyLetters(false);
    // Small delay to ensure state is reset before navigation
    setTimeout(() => {
      onNavigateToLetters('myLetters'); // Pass source as 'myLetters'
    }, 0);
  };

  // Generate personalized colors based on receiver name
  const getPersonalizedColors = (name) => {
    if (!name) return { 
      primary: 'rose', 
      secondary: 'pink', 
      accent: 'purple',
      gradients: {
        card1: 'from-rose-500 to-pink-500',
        card2: 'from-pink-500 to-purple-500',
        card3: 'from-purple-500 to-rose-500',
      }
    };
    
    // Simple hash function to generate consistent colors from name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colorSchemes = [
      { 
        primary: 'rose', 
        secondary: 'pink', 
        accent: 'purple',
        gradients: {
          card1: 'from-rose-500 to-pink-500',
          card2: 'from-pink-500 to-purple-500',
          card3: 'from-purple-500 to-rose-500',
        }
      },
      { 
        primary: 'pink', 
        secondary: 'rose', 
        accent: 'fuchsia',
        gradients: {
          card1: 'from-pink-500 to-rose-500',
          card2: 'from-rose-500 to-fuchsia-500',
          card3: 'from-fuchsia-500 to-pink-500',
        }
      },
      { 
        primary: 'purple', 
        secondary: 'pink', 
        accent: 'rose',
        gradients: {
          card1: 'from-purple-500 to-pink-500',
          card2: 'from-pink-500 to-rose-500',
          card3: 'from-rose-500 to-purple-500',
        }
      },
      { 
        primary: 'rose', 
        secondary: 'purple', 
        accent: 'pink',
        gradients: {
          card1: 'from-rose-500 to-purple-500',
          card2: 'from-purple-500 to-pink-500',
          card3: 'from-pink-500 to-rose-500',
        }
      },
      { 
        primary: 'fuchsia', 
        secondary: 'rose', 
        accent: 'pink',
        gradients: {
          card1: 'from-fuchsia-500 to-rose-500',
          card2: 'from-rose-500 to-pink-500',
          card3: 'from-pink-500 to-fuchsia-500',
        }
      },
    ];
    
    return colorSchemes[Math.abs(hash) % colorSchemes.length];
  };

  const colors = getPersonalizedColors(receiverData?.name);
  const receiverName = receiverData?.name || 'Your Loved One';

  // Memoize background elements to prevent regeneration on every render
  const backgroundHearts = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      const rand4 = Math.random();
      const rand5 = Math.random();
      const rand6 = Math.random();
      return {
        id: i,
        left: rand1 * 100,
        top: rand2 * 100,
        fontSize: 20 + rand3 * 40,
        duration: 8 + rand4 * 4,
        delay: rand5 * 2,
        xOffset: rand6 * 50 - 25,
      };
    });
  }, []);

  const backgroundStars = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      const rand4 = Math.random();
      const rand5 = Math.random();
      const size = rand1 < 0.7 ? 2 : rand2 < 0.9 ? 3 : 4;
      return {
        id: i,
        size,
        left: rand3 * 100,
        top: rand4 * 100,
        duration: 3 + rand5 * 3,
        delay: Math.random() * 2,
      };
    });
  }, []);

  const backgroundBlobs = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      const rand4 = Math.random();
      return {
        id: i,
        width: 200 + rand1 * 300,
        height: 200 + rand2 * 300,
        left: rand3 * 100,
        top: rand4 * 100,
        duration: 20 + Math.random() * 10,
        delay: Math.random() * 5,
        isEven: i % 2 === 0,
      };
    });
  }, []);

  const backgroundSparkles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      return {
        id: i,
        left: rand1 * 100,
        top: rand2 * 100,
        duration: 2 + rand3 * 2,
        delay: Math.random() * 3,
      };
    });
  }, []);

  // Fetch user's first name
  useEffect(() => {
    const fetchUserFirstName = async () => {
      if (!currentUser) return;

      try {
        // Get Firebase ID token for authentication
        const idToken = await currentUser.getIdToken();
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
        const response = await fetch(`${backendUrl}/api/auth/user/${currentUser.uid}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success && result.data && result.data.firstName) {
          setUserFirstName(result.data.firstName);
        }
      } catch (error) {
        console.log('Could not fetch user profile:', error);
        // Fallback: try to get from currentUser.displayName or email
        if (currentUser.displayName) {
          setUserFirstName(currentUser.displayName.trim().split(/\s+/)[0]);
        } else if (currentUser.email) {
          const emailName = currentUser.email.split('@')[0];
          setUserFirstName(emailName.trim().split(/\s+/)[0]);
        }
      }
    };

    fetchUserFirstName();
  }, [currentUser]);

  // Helper to get gradient style
  const getGradientStyle = (gradientKey) => {
    const gradientMap = {
      'from-rose-500 to-pink-500': 'linear-gradient(to bottom right, rgb(244, 63, 94), rgb(236, 72, 153))',
      'from-pink-500 to-purple-500': 'linear-gradient(to bottom right, rgb(236, 72, 153), rgb(168, 85, 247))',
      'from-purple-500 to-rose-500': 'linear-gradient(to bottom right, rgb(168, 85, 247), rgb(244, 63, 94))',
      'from-pink-500 to-rose-500': 'linear-gradient(to bottom right, rgb(236, 72, 153), rgb(244, 63, 94))',
      'from-rose-500 to-fuchsia-500': 'linear-gradient(to bottom right, rgb(244, 63, 94), rgb(217, 70, 239))',
      'from-fuchsia-500 to-pink-500': 'linear-gradient(to bottom right, rgb(217, 70, 239), rgb(236, 72, 153))',
      'from-purple-500 to-pink-500': 'linear-gradient(to bottom right, rgb(168, 85, 247), rgb(236, 72, 153))',
      'from-rose-500 to-purple-500': 'linear-gradient(to bottom right, rgb(244, 63, 94), rgb(168, 85, 247))',
    };
    return gradientMap[gradientKey] || gradientMap['from-rose-500 to-pink-500'];
  };

  // Helper to get gradient class for cards
  const getGradientClass = (gradientKey) => {
    const gradientMap = {
      'from-rose-500 to-pink-500': 'from-rose-500 to-pink-500',
      'from-pink-500 to-purple-500': 'from-pink-500 to-purple-500',
      'from-purple-500 to-rose-500': 'from-purple-500 to-rose-500',
      'from-pink-500 to-rose-500': 'from-pink-500 to-rose-500',
      'from-rose-500 to-fuchsia-500': 'from-fuchsia-500 to-rose-500',
      'from-fuchsia-500 to-pink-500': 'from-fuchsia-500 to-pink-500',
      'from-purple-500 to-pink-500': 'from-purple-500 to-pink-500',
      'from-rose-500 to-purple-500': 'from-rose-500 to-purple-500',
    };
    return gradientMap[gradientKey] || 'from-rose-500 to-pink-500';
  };

  const dashboardCards = [
    {
      id: 'letters',
      title: 'My Letters',
      description: 'Write and manage your heartfelt letters',
      icon: '💌',
      gradient: colors.gradients.card1,
      onClick: () => setShowMyLetters(true),
    },
    {
      id: 'date-planning',
      title: 'Date Planning',
      description: 'Plan and organize special dates',
      icon: '📅',
      gradient: colors.gradients.card2,
      onClick: () => {
        setShowDatePlanning(true);
        if (onNavigateToDatePlanning) {
          onNavigateToDatePlanning();
        }
      },
    },
    {
      id: 'games',
      title: 'Games',
      description: 'Create and play romantic games',
      icon: '🎮',
      gradient: colors.gradients.card3,
      onClick: () => setShowGames(true),
    },
  ];

  // Dashboard is always in sender mode - receivers access letters via token links

  // Show My Letters view
  if (showMyLetters) {
    return (
      <MyLetters
        receiverData={receiverData}
        onBack={() => {
          setShowMyLetters(false);
          if (onMyLettersClose) {
            onMyLettersClose();
          }
        }}
        onCreateLetter={() => {
          // When creating letter from MyLetters, pass 'myLetters' as source
          handleNavigateToLetters();
        }}
      />
    );
  }

  if (showDatePlanning) {
    return (
      <DatePlanning
        onBack={() => setShowDatePlanning(false)}
      />
    );
  }

  if (showGames) {
    return (
      <Games
        onBack={() => setShowGames(false)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Hearts - Memoized */}
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
              x: [0, heart.xOffset, 0],
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

        {/* Floating Stars - Memoized */}
        {backgroundStars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute bg-pink-300/30 rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: `0 0 ${star.size * 3}px rgba(244, 63, 94, 0.5)`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.5, 0.8],
              y: [0, -50, 0],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Animated Gradient Blobs - Memoized */}
        {backgroundBlobs.map((blob) => (
          <motion.div
            key={`blob-${blob.id}`}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: `${blob.width}px`,
              height: `${blob.height}px`,
              background: blob.isEven 
                ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.4), rgba(236, 72, 153, 0.4))'
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(217, 70, 239, 0.4))',
              left: `${blob.left}%`,
              top: `${blob.top}%`,
            }}
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              scale: [1, 1.3, 0.8, 1],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              delay: blob.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Sparkles - Memoized */}
        {backgroundSparkles.map((sparkle) => (
          <motion.div
            key={`sparkle-${sparkle.id}`}
            className="absolute"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: sparkle.duration,
              repeat: Infinity,
              delay: sparkle.delay,
              ease: "easeInOut",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-pink-400"
            >
              <path
                d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
                fill="currentColor"
                opacity="0.6"
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 w-full z-50 overflow-hidden shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative py-4 md:py-6 lg:py-8 px-3 sm:px-4 md:px-8"
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

          <div className="relative max-w-7xl mx-auto">
            {/* Mobile Layout: Stacked */}
            <div className="flex flex-col md:hidden gap-3">
              {/* Top Row: Logo and Actions */}
              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => window.location.href = '/'}
                >
                  <img 
                    src="/dearly-logo.svg" 
                    alt="Dearly" 
                    className="h-8 w-auto drop-shadow-lg"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </motion.div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all shadow-lg flex-shrink-0">
                    <NotificationBell />
                  </div>
                  <motion.button
                    onClick={() => setShowProfileModal(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white transition-all shadow-lg flex-shrink-0"
                    title="Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
              {/* Centered Greeting */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <h1 className="text-xl font-serif font-bold text-white drop-shadow-lg mb-1">
                  For {receiverName}{' '}
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
                    💕
                  </motion.span>
                </h1>
                <p className="text-white/90 text-xs font-serif italic drop-shadow-md">
                  Express your heart, beautifully
                </p>
              </motion.div>
            </div>

            {/* Desktop Layout: Horizontal */}
            <div className="hidden md:flex items-center justify-between">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => window.location.href = '/'}
              >
                <img 
                  src="/dearly-logo.svg" 
                  alt="Dearly" 
                  className="h-10 lg:h-14 w-auto drop-shadow-lg"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </motion.div>

              {/* Centered Personalized Greeting with Tagline */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col items-center justify-center text-center absolute left-1/2 transform -translate-x-1/2"
              >
                <h1 className="text-2xl lg:text-4xl font-serif font-bold text-white drop-shadow-lg mb-1 whitespace-nowrap">
                  For {receiverName}{' '}
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
                    💕
                  </motion.span>
                </h1>
                <p className="text-white/90 text-sm lg:text-lg font-serif italic drop-shadow-md whitespace-nowrap">
                  Express your heart, beautifully
                </p>
              </motion.div>

              {/* Notification Bell and Profile Button */}
              <div className="flex items-center gap-3">
                <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all shadow-lg">
                  <NotificationBell />
                </div>
                <motion.button
                  onClick={() => setShowProfileModal(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 lg:p-3.5 text-white transition-all shadow-lg flex-shrink-0"
                  title="Profile"
                >
                  <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dashboard Cards */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-800 text-center mb-2 px-2">
            {userFirstName ? `What would you like to do today, ${userFirstName}?` : 'What would you like to do today?'}
          </h2>
          <p className="text-gray-600 text-center font-serif italic text-sm sm:text-base px-2">
            Choose an option to get started
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-sm sm:max-w-none mx-auto sm:mx-0">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative h-full"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={card.onClick}
                className={`relative bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-rose-200 group overflow-hidden w-full h-full flex flex-col min-h-[200px] sm:min-h-[240px] md:min-h-[280px] ${
                  card.comingSoon ? 'opacity-75' : ''
                }`}
              >
                {/* Gradient Background on Hover */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 rounded-2xl"
                  style={{ background: getGradientStyle(card.gradient) }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />

                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{
                    x: hoveredCard === card.id ? "200%" : "-100%",
                  }}
                  transition={{ duration: 0.6 }}
                />

                {/* Decorative gradient accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: getGradientStyle(card.gradient) }}
                />

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Mobile Layout: Icon above title */}
                  <div className="flex flex-col sm:hidden items-center mb-3">
                    <motion.div
                      className="text-5xl mb-3"
                      animate={{
                        scale: hoveredCard === card.id ? [1, 1.2, 1] : 1,
                        rotate: hoveredCard === card.id ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {card.icon}
                    </motion.div>
                    <h3 className="text-xl font-serif font-bold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors duration-300 text-center">
                      {card.title}
                    </h3>
                  </div>

                  {/* Desktop Layout: Icon and title side by side */}
                  <div className="hidden sm:flex items-start justify-between mb-3 sm:mb-4">
                    <motion.div
                      className="text-4xl sm:text-5xl md:text-6xl"
                      animate={{
                        scale: hoveredCard === card.id ? [1, 1.2, 1] : 1,
                        rotate: hoveredCard === card.id ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {card.icon}
                    </motion.div>
                    {!card.comingSoon && (
                      <motion.div
                        className="text-gray-300 group-hover:text-rose-400 transition-colors duration-300 flex-shrink-0"
                        animate={{ 
                          x: hoveredCard === card.id ? [0, 5, 0] : 0 
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: hoveredCard === card.id ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  
                  <h3 className="hidden sm:block text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors duration-300 text-center">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 font-serif text-xs sm:text-sm md:text-base mb-3 sm:mb-4 flex-1 leading-relaxed text-center">
                    {card.description}
                  </p>
                  
                  {card.comingSoon && (
                    <div className="mt-auto pt-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>

                {/* Subtle corner accent */}
                <div 
                  className="absolute bottom-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-full blur-2xl"
                  style={{ background: getGradientStyle(card.gradient) }}
                />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 sm:mt-12 md:mt-16 px-2"
        >
          <p className="text-gray-500 font-serif text-xs sm:text-sm italic">
            Made with 💕 by Elgen for Faith
          </p>
        </motion.div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        receiverData={receiverData}
        onReceiverUpdate={onReceiverUpdate}
      />
    </div>
  );
}

