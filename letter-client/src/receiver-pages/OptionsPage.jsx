// OptionsPage.jsx - Options menu after letter reading
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateLetterPDF } from "../utils/pdfGenerator";
import MessageModal from "../components/MessageModal.jsx";
import GameSelection from "../components/GameSelection.jsx";
import { useDashboardMusic } from "../contexts/DashboardMusicContext";
import { useAuth } from "../contexts/AuthContext";

export default function OptionsPage({ onWriteLetter, onDateInvitation, onViewAllLetters, onDownloadPDF, onBack, letterContent, onVoiceMessage, onPlayGame, userId, letterId, receiverName, onGamesUpdated, dashboardMusic, token, receiverEmail, senderUserId, isReceiverMode, onSwitchToSender }) {
  const { setPlaylistFromLetter, startPlaying } = useDashboardMusic();
  const { currentUser } = useAuth();
  
  // State for receiver mode (when accessed without a specific letter)
  const [receivedLetters, setReceivedLetters] = useState([]);
  const [isLoadingLetters, setIsLoadingLetters] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isSwitchingToSender, setIsSwitchingToSender] = useState(false);
  
  
  // Add keyboard shortcut to switch to sender mode (Ctrl+S or Cmd+S)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        console.log('⌨️ Keyboard shortcut detected: Switching to sender mode');
        localStorage.setItem('userRole', 'sender');
        window.location.href = '/';
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // If switching to sender, don't render anything (let Dashboard handle it)
  if (isSwitchingToSender) {
    console.log('🟡 OptionsPage: isSwitchingToSender is true, returning null');
    return null;
  }
  
  // Check if the logged-in user is actually the receiver
  // CRITICAL: Firebase Auth sessions are shared across browser tabs!
  // When receiver opens letter link in new tab, they might see sender's session from other tab
  // We show banner UNLESS we can confirm logged-in user IS the receiver (email matches)
  
  const [hoveredOption, setHoveredOption] = useState(null);
  const [games, setGames] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'warning' });
  const [showGameSelection, setShowGameSelection] = useState(false);
  const receiverFirstName = receiverName?.trim().split(" ")[0] || "";
  const headerText = receiverFirstName
    ? `What would you like to do, ${receiverFirstName}?`
    : "What would you like to do?";
  
  // Get user's name for receiver mode greeting
  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(" ")[0];
    }
    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }
    return "Friend";
  };
  
  const userDisplayName = getUserDisplayName();

  // Fetch received letters when in receiver mode without a specific letter
  // Use a ref to prevent multiple fetches
  const hasFetchedLetters = React.useRef(false);
  useEffect(() => {
    if (isReceiverMode && !selectedLetter && currentUser?.uid && !hasFetchedLetters.current) {
      hasFetchedLetters.current = true;
      const fetchReceivedLetters = async () => {
        setIsLoadingLetters(true);
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
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
          setIsLoadingLetters(false);
        }
      };
      fetchReceivedLetters();
    }
    // Reset the ref when switching modes
    if (!isReceiverMode) {
      hasFetchedLetters.current = false;
    }
  }, [isReceiverMode, selectedLetter, currentUser]);

  // If in receiver mode with a selected letter, show OptionsPage for that letter
  if (isReceiverMode && selectedLetter) {
    // Recursively render OptionsPage with the selected letter data
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
        isReceiverMode={false} // Not in receiver mode anymore, showing specific letter
        onSwitchToSender={onSwitchToSender}
        onWriteLetter={onWriteLetter} // Pass through the onWriteLetter handler
        onViewAllLetters={() => {
          setSelectedLetter(null);
        }}
        onBack={() => {
          setSelectedLetter(null);
        }}
      />
    );
  }

  // Fetch games for the user
  const fetchGames = async () => {
    if (!userId) return;
    setIsLoadingGames(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/games/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      } else {
        console.error('Failed to fetch games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setIsLoadingGames(false);
    }
  };


  const gamesFetched = useRef(false);
  useEffect(() => {
    if (isReceiverMode) {
      // Skip games fetch in receiver mode to prevent render loops
      setGames([]);
      return;
    }
    if (userId && !gamesFetched.current) {
      gamesFetched.current = true;
      fetchGames();
    } else if (!userId) {
      // If no userId, ensure games is empty array
      setGames([]);
    }
  }, [userId, isReceiverMode]);

  // Initialize dashboard music when component mounts or dashboardMusic changes
  // Only run this if NOT in receiver mode (to avoid render loops)
  useEffect(() => {
    if (isReceiverMode) return; // Skip music setup in receiver mode
    if (dashboardMusic && Array.isArray(dashboardMusic) && dashboardMusic.length > 0) {
      setPlaylistFromLetter(dashboardMusic);
      // Auto-play after a short delay (only if not already playing)
      setTimeout(() => {
        startPlaying();
      }, 500);
    } else if (!dashboardMusic || (Array.isArray(dashboardMusic) && dashboardMusic.length === 0)) {
      // Clear playlist if no dashboard music
      setPlaylistFromLetter([]);
    }
  }, [dashboardMusic, setPlaylistFromLetter, startPlaying, isReceiverMode]);

  // Listen for game completion events to refresh games list
  useEffect(() => {
    const handleGameCompleted = () => {
      // Refresh games list when a game is completed
      console.log('🔄 Refreshing games list after completion...');
      // Add a small delay to ensure backend has updated
      setTimeout(() => {
        fetchGames();
      }, 500);
    };

    const handleRefreshGames = () => {
      // Refresh games list when requested
      console.log('🔄 Refreshing games list...');
      // Add a small delay to ensure backend has updated
      setTimeout(() => {
        fetchGames();
      }, 500);
    };

    window.addEventListener('gameCompleted', handleGameCompleted);
    window.addEventListener('refreshGames', handleRefreshGames);
    return () => {
      window.removeEventListener('gameCompleted', handleGameCompleted);
      window.removeEventListener('refreshGames', handleRefreshGames);
    };
  }, [userId]); // Add userId as dependency

  // Filter games based on completion status
  const getAvailableGames = () => {
    // Safety check: ensure games is an array
    if (!Array.isArray(games)) {
      // If no games from sender, always provide a default Memory Match game with no rewards
      return [{
        id: 'default-memory-match',
        type: 'memory-match',
        title: 'Memory Match',
        hasReward: false,
        isCompleted: false,
      }];
    }
    
    // If no games from sender, always provide a default Memory Match game with no rewards
    if (games.length === 0) {
      return [{
        id: 'default-memory-match',
        type: 'memory-match',
        title: 'Memory Match',
        hasReward: false,
        isCompleted: false,
      }];
    }
    
    try {
      // Debug: Log all games and their completion status
      if (games.length > 0) {
        console.log('🎮 All games:', games.map(g => ({ id: g.id, type: g.type, isCompleted: g.isCompleted, hasReward: g.hasReward })));
      }
      
      // First, filter out completed games with rewards
      const nonCompletedGames = games.filter(g => g && !(g.isCompleted && g.hasReward));
      
      // If there's only one game total and it's completed, return empty array (hide card)
      if (games.length === 1 && games[0] && games[0].isCompleted && games[0].hasReward) {
        console.log('🚫 Hiding games card: Only one game and it\'s completed');
        return [];
      }
      
      // If there are multiple games, hide the game type that was completed
      if (games.length > 1) {
        // Find completed game types
        const completedGameTypes = new Set(
          games
            .filter(g => g && g.isCompleted && g.hasReward)
            .map(g => g.type)
            .filter(Boolean)
        );
        
        // If a game type is completed, hide all games of that type (even if not completed yet)
        if (completedGameTypes.size > 0) {
          console.log('🚫 Hiding game types:', Array.from(completedGameTypes));
          return nonCompletedGames.filter(g => g && !completedGameTypes.has(g.type));
        }
      }
      
      if (nonCompletedGames.length > 0) {
        console.log('✅ Available games:', nonCompletedGames.map(g => ({ id: g.id, type: g.type })));
      }
      return nonCompletedGames;
    } catch (error) {
      console.error('Error in getAvailableGames:', error);
      return [];
    }
  };

  const availableGames = useMemo(() => getAvailableGames(), [games]);

  // Get all rewards from completed games
  const getObtainedRewards = () => {
    // Safety check: ensure games is an array
    if (!Array.isArray(games) || games.length === 0) {
      return [];
    }
    
    try {
      const rewards = [];
      games.forEach(game => {
        if (game && game.isCompleted && game.claimedRewardId && game.rewards && Array.isArray(game.rewards)) {
          // Try multiple methods to find the claimed reward
          let reward = null;
          
          // Method 1: Try to find by exact ID match
          reward = game.rewards.find(r => {
            return r.id === game.claimedRewardId || 
                   r._id === game.claimedRewardId ||
                   r.name === game.claimedRewardId;
          });
          
          // Method 2: Try to parse index from claimedRewardId (e.g., "reward_index_0", "0", etc.)
          if (!reward) {
            const indexMatch = game.claimedRewardId.match(/(\d+)/);
            if (indexMatch) {
              const idx = parseInt(indexMatch[1], 10);
              if (!isNaN(idx) && game.rewards[idx]) {
                reward = game.rewards[idx];
              }
            }
          }
          
          // Method 3: Try finding by index if claimedRewardId looks like "reward_index_X"
          if (!reward && typeof game.claimedRewardId === 'string' && game.claimedRewardId.startsWith('reward_index_')) {
            const idx = parseInt(game.claimedRewardId.replace('reward_index_', ''), 10);
            if (!isNaN(idx) && game.rewards[idx]) {
              reward = game.rewards[idx];
            }
          }
          
          // Method 4: Try direct numeric index
          if (!reward && !isNaN(parseInt(game.claimedRewardId, 10))) {
            const idx = parseInt(game.claimedRewardId, 10);
            if (game.rewards[idx]) {
              reward = game.rewards[idx];
            }
          }
          
          if (reward) {
            rewards.push({
              ...reward,
              gameTitle: game.title || 'Game',
              gameType: game.type,
              completedAt: game.completedAt,
              fulfilled: game.rewardFulfilled || false,
              gameId: game.id,
            });
          }
        }
      });
      return rewards;
    } catch (error) {
      console.error('Error in getObtainedRewards:', error);
      return [];
    }
  };

  const obtainedRewards = useMemo(() => getObtainedRewards(), [games]);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  const options = useMemo(() => {
    const baseOptions = [];
    
    // Only show "View All Letters" if NOT in receiver mode
    // (In receiver mode, letters are already displayed above)
    if (!isReceiverMode) {
      baseOptions.push({
        id: "view-all-letters",
        icon: "📜",
        title: "View All Letters",
        description: "Browse through all your letters",
        color: "from-emerald-500 to-teal-500",
        hoverColor: "from-emerald-600 to-teal-600",
        onClick: onViewAllLetters || (() => {
          setModal({ isOpen: true, message: "View all letters feature coming soon!", type: 'info' });
        }),
      });
    }
    
    // Add other options
    baseOptions.push(
      {
        id: "write-letter",
        icon: "✉️",
        title: "Write a Letter Back",
        description: "Compose and send a heartfelt response",
        color: "from-pink-500 to-rose-500",
        hoverColor: "from-pink-600 to-rose-600",
        onClick: () => {
          if (onWriteLetter) {
            onWriteLetter();
          }
        },
      },
      {
        id: "download-pdf",
        icon: "📄",
        title: "Download Letter as PDF",
        description: "Save this beautiful letter forever",
        color: "from-yellow-500 to-amber-500",
        hoverColor: "from-yellow-600 to-amber-600",
        onClick: onDownloadPDF || (async () => {
          if (letterContent) {
            try {
              // letterContent should be just mainBody
              // Names are not used anymore (removed from PDF)
              await generateLetterPDF(letterContent, "", "");
              
              // Create notification when PDF is downloaded
              if (userId && letterId) {
                try {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                  const notificationResponse = await fetch(`${backendUrl}/api/notifications/${userId}/create`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      type: 'letter_pdf_download',
                      letterId: letterId,
                      letterTitle: 'Your Letter',
                      message: `${receiverFirstName || 'Your loved one'} downloaded your letter as PDF! 📄`,
                      receiverName: receiverFirstName || 'Your loved one',
                    }),
                  });
                  if (notificationResponse.ok) {
                    console.log('✅ Notification created for PDF download');
                  }
                } catch (err) {
                  console.error('Error creating PDF download notification:', err);
                }
              }
            } catch (error) {
              console.error("Error generating PDF:", error);
              setModal({ isOpen: true, message: "There was an error generating the PDF. Please try again.", type: 'error' });
            }
          } else {
            setModal({ isOpen: true, message: "Letter content not available.", type: 'warning' });
          }
        }),
      },
      {
        id: "date-invitation",
        icon: "💑",
        title: "Date Invitation",
        description: "View and RSVP to date invitations",
        color: "from-blue-500 to-cyan-500",
        hoverColor: "from-blue-600 to-cyan-600",
        onClick: onDateInvitation || (() => {
          setModal({ isOpen: true, message: "Date invitation feature coming soon!", type: 'info' });
        }),
      },
      {
        id: "voice-message",
        icon: "🎤",
        title: "Send a Voice Message",
        description: "Record a personal voice response",
        color: "from-violet-500 to-fuchsia-500",
        hoverColor: "from-violet-600 to-fuchsia-600",
        onClick: onVoiceMessage || (() => {
          setModal({ isOpen: true, message: "Voice message feature coming soon!", type: 'info' });
        }),
      }
    );
    
    return baseOptions;
  }, [onViewAllLetters, onWriteLetter, onDownloadPDF, onDateInvitation, onVoiceMessage, letterContent, isReceiverMode, receiverFirstName, userId, letterId]);


  // Memoize stars to prevent regeneration on every render
  const stars = useMemo(() => {
    try {
      return [...Array(100)].map((_, i) => {
        const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
        return {
          id: `star-${i}`,
          size,
          delay: Math.random() * 5,
          duration: 3 + Math.random() * 4,
          left: Math.random() * 100,
          top: Math.random() * 100,
        };
      });
    } catch (error) {
      console.error('Error creating stars:', error);
      return [];
    }
  }, []);

  // Memoize hearts to prevent regeneration on every render
  const hearts = useMemo(() => {
    try {
      return [...Array(8)].map((_, i) => ({
        id: `heart-${i}`,
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 80,
        fontSize: 12 + Math.random() * 20,
        duration: 4 + Math.random() * 3,
        delay: Math.random() * 2,
      }));
    } catch (error) {
      console.error('Error creating hearts:', error);
      return [];
    }
  }, []);



  // Safety check: ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div 
      className="h-screen w-full flex items-center justify-center relative overflow-hidden"
    >
      {/* Romantic Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)",
            "radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #2d1b4e 100%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Stars Background */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Hearts */}
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-300/40"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 10, -10, 0],
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

      {/* Soft Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Back Button - Top Left */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
          aria-label="Go back"
        >
          <svg
            className="w-6 h-6 text-white group-hover:text-pink-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>
      )}


      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', minHeight: '100vh' }}>
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full relative z-20 pb-4 md:pb-0"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 md:mb-8 px-2"
          >
            {isReceiverMode && !selectedLetter ? (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-2 md:mb-3">
                  Welcome back, {userDisplayName}! 💌
                </h1>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl font-serif italic px-2">
                  Here are all the letters you've received...
                </p>
              </>
            ) : !isReceiverMode ? (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-2 md:mb-3">
                  {headerText || "What would you like to do?"}
                </h1>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl font-serif italic px-2">
                  Choose an option to continue your journey...
                </p>
              </>
            ) : null}
          </motion.div>
          
          {/* Receiver Mode: Show Received Letters List */}
          {isReceiverMode && !selectedLetter && (
            <motion.div
              data-letters-section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 px-4 w-full"
            >
              {isLoadingLetters ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-6xl mb-4 inline-block"
                  >
                    💕
                  </motion.div>
                  <p className="text-white/70 font-serif text-lg">Loading your letters...</p>
                </div>
              ) : receivedLetters.length === 0 ? (
                <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                  <div className="text-6xl mb-4">📭</div>
                  <h2 className="text-2xl font-serif font-bold text-white mb-2">No letters yet</h2>
                  <p className="text-white/70 font-serif mb-4">Letters you receive will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {receivedLetters.map((letter, index) => (
                    <motion.div
                      key={letter.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => {
                        setSelectedLetter(letter);
                      }}
                      className="bg-white/10 backdrop-blur-md rounded-lg md:rounded-2xl p-3 md:p-6 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-pink-200"
                    >
                      <div className="text-2xl md:text-4xl mb-2 md:mb-3">💌</div>
                      <h3 className="text-sm md:text-xl font-serif font-bold text-white mb-1 md:mb-2">
                        {letter.title || letter.introductory?.substring(0, 30) || 'Letter'}
                      </h3>
                      {letter.createdAt && (
                        <p className="text-white/70 font-serif text-xs md:text-sm mb-2 md:mb-4">
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-white/90 font-serif text-[10px] md:text-sm line-clamp-2 leading-tight md:leading-normal">
                        {letter.introductory || letter.content?.substring(0, 100) || 'Click to view options...'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          
          {/* Regular Options - Show when not in receiver mode, or when a letter is selected, or when there are letters in receiver mode */}
          {(!isReceiverMode || selectedLetter || (isReceiverMode && receivedLetters.length > 0)) && (
            <>

          
          {/* Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6 px-2 md:px-2">
            {/* Regular Options */}
            {safeOptions.length > 0 ? safeOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onMouseEnter={() => setHoveredOption(option.id)}
                onMouseLeave={() => setHoveredOption(null)}
                className="relative"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    option.onClick();
                  }}
                  className={`w-full min-h-[120px] md:min-h-[160px] p-3 md:p-6 rounded-lg md:rounded-2xl bg-gradient-to-br ${option.color} shadow-xl hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden group`}
                >
                  {/* Shimmer effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{
                      x: hoveredOption === option.id ? "200%" : "-100%",
                    }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <motion.div
                      className="text-2xl md:text-4xl mb-1 md:mb-3"
                      animate={{
                        scale: hoveredOption === option.id ? [1, 1.2, 1] : 1,
                        rotate: hoveredOption === option.id ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {option.icon}
                    </motion.div>
                    <h3 className="text-sm md:text-xl font-serif text-white mb-0.5 md:mb-2">
                      {option.title}
                    </h3>
                    <p className="text-white/90 text-[10px] md:text-sm font-serif leading-tight md:leading-normal">
                      {option.description}
                    </p>
                  </div>

                  {/* Decorative corner elements */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-white/30" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-white/30" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-white/30" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-white/30" />
                </motion.button>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-white/70 font-serif text-lg">Loading options...</p>
              </div>
            )}

            {/* Games Card - Single card for all games */}
            {/* Hide if only one game exists and it's completed, or if no available games */}
            {availableGames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + options.length * 0.1 }}
                onMouseEnter={() => setHoveredOption('games')}
                onMouseLeave={() => setHoveredOption(null)}
                className="relative"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGameSelection(true);
                  }}
                  className="w-full min-h-[120px] md:min-h-[160px] p-3 md:p-6 rounded-lg md:rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-xl hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden group"
                >
                  {/* Shimmer effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{
                      x: hoveredOption === 'games' ? "200%" : "-100%",
                    }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Reward Badge if any game has reward */}
                  {availableGames.some(g => g.hasReward && !g.isCompleted) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + options.length * 0.1, type: "spring", stiffness: 200 }}
                      className="absolute top-2 right-2 z-20 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1"
                    >
                      <span>🎁</span>
                      <span>Rewards</span>
                    </motion.div>
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    <motion.div
                      className="text-2xl md:text-4xl mb-1 md:mb-3"
                      animate={{
                        scale: hoveredOption === 'games' ? [1, 1.2, 1] : 1,
                        rotate: hoveredOption === 'games' ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      🎮
                    </motion.div>
                    <h3 className="text-sm md:text-xl font-serif text-white mb-0.5 md:mb-2">
                      Play Games
                    </h3>
                    <p className="text-white/90 text-[10px] md:text-sm font-serif leading-tight md:leading-normal">
                      {availableGames.length} {availableGames.length === 1 ? 'game' : 'games'} available
                      {availableGames.some(g => g.hasReward && !g.isCompleted) ? ' · Win prizes!' : ''}
                    </p>
                  </div>

                  {/* Decorative corner elements */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-white/30" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-white/30" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-white/30" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-white/30" />
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-6"
          >
            <p className="text-white/60 font-serif text-sm italic">
              Made with 💕 by Elgen for Faith
            </p>
          </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Game Selection Modal */}
      <AnimatePresence>
        {showGameSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <GameSelection
              games={availableGames}
              userId={userId}
              onSelectGame={(game) => {
                setShowGameSelection(false);
                if (onPlayGame) {
                  onPlayGame(game);
                }
              }}
              onBack={() => {
                setShowGameSelection(false);
                // Refresh games list when coming back
                fetchGames();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewards Modal */}
      <AnimatePresence>
        {showRewardsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRewardsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#2d1b4e]/95 rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`
                .overflow-y-auto::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-serif text-white mb-2 flex items-center gap-2">
                    <span>🎁</span>
                    Your Rewards
                  </h2>
                  <p className="text-white/70 font-serif text-sm">
                    Rewards you've earned from playing games
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRewardsModal(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Rewards List */}
              <div className="space-y-4">
                {obtainedRewards.map((reward, index) => (
                  <motion.div
                    key={`${reward.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">
                        {(() => {
                          // Use consistent icons based on reward type
                          if (reward?.type === 'food-drink') {
                            return '🍕';
                          } else if (reward?.type === 'date-outing') {
                            return '🎬';
                          } else if (reward?.type === 'emotional-digital') {
                            return '💌';
                          }
                          // Fallback to generic reward icon
                          return reward.icon || '🎁';
                        })()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif text-white mb-1">
                          {reward.name || reward.title || 'Reward'}
                        </h3>
                        {reward.description && (
                          <p className="text-white/80 font-serif text-sm mb-2">
                            {reward.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs font-serif">
                            From: {reward.gameTitle}
                          </span>
                          {reward.completedAt && (
                            <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs font-serif">
                              {new Date(reward.completedAt).toLocaleDateString()}
                            </span>
                          )}
                          {/* Reward Status Badge */}
                          {reward.fulfilled !== undefined && (
                            reward.fulfilled ? (
                              <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-serif font-semibold">
                                ✓ Fulfilled
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full text-xs font-serif font-semibold">
                                ⏳ Pending
                              </span>
                            )
                          )}
                        </div>
                        {reward.content && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-white/90 font-serif text-sm whitespace-pre-wrap">
                              {reward.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State (shouldn't show, but just in case) */}
              {obtainedRewards.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎁</div>
                  <p className="text-white/70 font-serif text-lg">
                    No rewards yet. Play games to earn rewards!
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Message Modal */}
      <MessageModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, message: '', type: 'warning' })}
        message={modal.message}
        type={modal.type}
      />

    </div>
  );
}

