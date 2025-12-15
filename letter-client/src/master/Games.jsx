// Games.jsx - Game selection and management screen
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GameCreationFlow from './GameCreationFlow';
import LoveQuizCreator from './LoveQuizCreator';
import RewardSetup from './RewardSetup';
import GameTypeSelection from './GameTypeSelection';
import MessageModal from '../components/MessageModal.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

export default function Games({ onBack, gameToEdit = null, fromExtras = false }) {
  const { currentUser } = useAuth();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [managingGame, setManagingGame] = useState(null);
  const [editingQuizGame, setEditingQuizGame] = useState(null);
  const [editingRewardsGame, setEditingRewardsGame] = useState(null);
  const [showGameTypeSelection, setShowGameTypeSelection] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [currentGameType, setCurrentGameType] = useState(null); // Track which game type we're editing from
  const [gameToReplace, setGameToReplace] = useState(null); // Track the game being replaced
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'error' });
  const [showConversionConfirm, setShowConversionConfirm] = useState(false);
  const [pendingGameType, setPendingGameType] = useState(null); // Store the game type pending confirmation
  const convertToMemoryMatchRef = useRef(false); // Track if conversion is in progress
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [showCompletionStatus, setShowCompletionStatus] = useState(false);
  const [completionStatusGame, setCompletionStatusGame] = useState(null);

  // Fetch games
  const fetchGames = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}`);
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      } else {
        console.error('Failed to fetch games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [currentUser]);

  // If gameToEdit is provided, open the game details modal after games are loaded
  useEffect(() => {
    if (gameToEdit && games.length > 0 && !isLoading) {
      const game = games.find(g => g.id === gameToEdit.id);
      if (game) {
        setManagingGame(game);
      }
    }
  }, [gameToEdit, games, isLoading]);

  // Handle automatic conversion to memory-match when no games exist
  useEffect(() => {
    if (selectedGameType === 'memory-match' && gameToReplace && !convertToMemoryMatchRef.current) {
      const filteredGames = games.filter(game => game.type === 'memory-match');
      if (filteredGames.length === 0) {
        convertToMemoryMatchRef.current = true;
        
        const convertToMemoryMatch = async () => {
          if (!currentUser || !gameToReplace) {
            convertToMemoryMatchRef.current = false;
            return;
          }
          try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            
            // Update the existing game to be a memory match game (without rewards)
            const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${gameToReplace.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: 'Memory Match',
                type: 'memory-match',
                questions: null, // Remove quiz data
                pairs: null,
                settings: {},
                rewards: null, // No rewards initially
                hasReward: false,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Game converted successfully:', result.game);
              // Force refresh games list
              await fetchGames();
              // Small delay to ensure state updates
              setTimeout(() => {
                setSelectedGameType(null);
                setCurrentGameType(null);
                setGameToReplace(null);
                convertToMemoryMatchRef.current = false;
              }, 100);
            } else {
              const error = await response.json();
              setModal({
                isOpen: true,
                message: error.error || 'Failed to convert game',
                type: 'error',
              });
              // Reset on error
              setSelectedGameType(null);
              setCurrentGameType(null);
              setGameToReplace(null);
              convertToMemoryMatchRef.current = false;
            }
          } catch (error) {
            console.error('Error converting game:', error);
            setModal({
              isOpen: true,
              message: 'Failed to convert game. Please try again.',
              type: 'error',
            });
            // Reset on error
            setSelectedGameType(null);
            setCurrentGameType(null);
            setGameToReplace(null);
            convertToMemoryMatchRef.current = false;
          }
        };

        convertToMemoryMatch();
      }
    }
  }, [selectedGameType, gameToReplace, games, currentUser, fetchGames]);

  const handleGameCreated = () => {
    fetchGames();
    setShowCreateFlow(false);
  };

  const saveGameChanges = async (gameId, updates) => {
    if (!currentUser) return { success: false };
    try {
      // Filter out undefined values before sending to API
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanUpdates),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to update game';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating game:', error);
      console.error('Error details:', {
        gameId,
        updates,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      return { success: false, error: error.message };
    }
  };

  const handleDeleteGame = (game) => {
    setGameToDelete(game);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGame = async () => {
    if (!currentUser || !gameToDelete) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${gameToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete game');
      }
      setManagingGame(null);
      setShowDeleteConfirm(false);
      setGameToDelete(null);
      await fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      setModal({
        isOpen: true,
        message: error.message || 'Failed to delete game',
        type: 'error',
      });
      setShowDeleteConfirm(false);
      setGameToDelete(null);
    }
  };

  const handleRewardsUpdated = async (game, rewards) => {
    const result = await saveGameChanges(game.id, {
      rewards,
      hasReward: true,
    });
    if (result.success) {
      setEditingRewardsGame(null);
      fetchGames();
    } else {
      setModal({
        isOpen: true,
        message: result.error || 'Failed to update game rewards',
        type: 'error',
      });
    }
  };

  const handleQuizUpdated = async (game, quizData) => {
    const result = await saveGameChanges(game.id, {
      title: quizData.title,
      questions: quizData.questions,
      settings: quizData.settings,
    });
    if (result.success) {
      setEditingQuizGame(null);
      fetchGames();
    } else {
      setModal({
        isOpen: true,
        message: result.error || 'Failed to update quiz',
        type: 'error',
      });
    }
  };

  if (editingQuizGame) {
    return (
      <LoveQuizCreator
        onBack={() => setEditingQuizGame(null)}
        skipSave={true}
        quizToEdit={{
          id: editingQuizGame.id,
          title: editingQuizGame.title,
          questions: editingQuizGame.questions || [],
          settings: editingQuizGame.settings || {},
        }}
        onSaved={(quizData) => handleQuizUpdated(editingQuizGame, quizData)}
      />
    );
  }

  if (editingRewardsGame) {
    return (
      <RewardSetup
        onBack={() => setEditingRewardsGame(null)}
        initialRewards={editingRewardsGame.game.rewards || []}
        mode={editingRewardsGame.mode}
        onComplete={(rewards) => handleRewardsUpdated(editingRewardsGame.game, rewards)}
      />
    );
  }

  // If fromExtras, show game creation flow (which starts with game type selection)
  if (fromExtras && !showGameTypeSelection && !showCreateFlow && !managingGame && !editingQuizGame && !editingRewardsGame) {
    return (
      <GameCreationFlow
        onBack={() => {
          if (onBack) onBack();
        }}
        onGameCreated={() => {
          fetchGames();
          // After game is created, go back to extras
          if (onBack) onBack();
        }}
        fromExtras={true}
      />
    );
  }

  if (showGameTypeSelection) {
    // Filter out the current game type - only show the other type
    const allTypes = ['quiz', 'memory-match'];
    const availableTypes = allTypes.filter(type => type !== currentGameType);

    if (availableTypes.length === 0) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
              No Other Game Types Available
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowGameTypeSelection(false);
                setCurrentGameType(null);
                setGameToReplace(null);
              }}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg"
            >
              Back
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return (
      <>
        <GameTypeSelection
          onBack={() => {
            setShowGameTypeSelection(false);
            setCurrentGameType(null);
            setGameToReplace(null);
          }}
          onSelect={(type) => {
            // Show confirmation modal instead of immediately proceeding
            setPendingGameType(type);
            setShowConversionConfirm(true);
          }}
          availableTypes={availableTypes} // Pass filtered types
          isEditMode={!!gameToReplace || !!currentGameType} // True if we're editing/replacing a game
        />
        
        {/* Conversion Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConversionConfirm}
          onConfirm={() => {
            setSelectedGameType(pendingGameType);
            setShowGameTypeSelection(false);
            setShowConversionConfirm(false);
            setPendingGameType(null);
          }}
          onCancel={() => {
            setShowConversionConfirm(false);
            setPendingGameType(null);
          }}
          isLoading={false}
          icon="🔄"
          title="Convert Game Type?"
          message={`This will convert your ${currentGameType === 'quiz' ? 'Quiz Game' : 'Memory Match'} to a ${pendingGameType === 'quiz' ? 'Quiz Game' : 'Memory Match'}. The current game data will be replaced. This action cannot be undone.`}
        />
      </>
    );
  }

  // Show game list filtered by selected type, or allow creation if no games exist
  if (selectedGameType) {
    const filteredGames = games.filter(game => game.type === selectedGameType);
    
    // If no games of this type exist, allow creating one to replace the current game
    if (filteredGames.length === 0) {
      // For quiz games, go to quiz creator
      if (selectedGameType === 'quiz') {
        return (
          <LoveQuizCreator
            onBack={() => {
              setSelectedGameType(null);
              setCurrentGameType(null);
              setGameToReplace(null);
            }}
            skipSave={false}
            onSaved={async (quizData) => {
              // Replace the current game with the new quiz game
              if (!currentUser || !gameToReplace) return;
              try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                
                // Update the existing game to be a quiz game
                const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${gameToReplace.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    title: quizData.title,
                    type: 'quiz',
                    questions: quizData.questions,
                    settings: quizData.settings,
                    pairs: null, // Remove memory match data
                    rewards: gameToReplace.rewards || null, // Keep existing rewards if any
                    hasReward: gameToReplace.hasReward || false,
                  }),
                });

                if (response.ok) {
                  const result = await response.json();
                  console.log('✅ Game updated successfully:', result.game);
                  // Force refresh games list
                  await fetchGames();
                  // Small delay to ensure state updates
                  setTimeout(() => {
                    setSelectedGameType(null);
                    setCurrentGameType(null);
                    setGameToReplace(null);
                  }, 100);
                } else {
                  const error = await response.json();
                  setModal({
                    isOpen: true,
                    message: error.error || 'Failed to update game',
                    type: 'error',
                  });
                }
              } catch (error) {
                console.error('Error updating game:', error);
                setModal({
                  isOpen: true,
                  message: 'Failed to update game. Please try again.',
                  type: 'error',
                });
              }
            }}
          />
        );
      } else {
        // For memory match, show loading state while conversion happens in useEffect
        // The actual conversion is handled in the useEffect hook above
        return (
          <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-6xl mb-4 animate-pulse">🔄</div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                Converting Game...
              </h2>
              <p className="text-gray-600 font-serif">
                Please wait while we convert your game.
              </p>
            </motion.div>
          </div>
        );
      }
    }

    // If games exist, show the selection screen
    return (
      <GameSelectionScreen
        games={filteredGames}
        gameType={selectedGameType}
        onSelectGame={async (game) => {
          // Replace the current game with the selected game
          if (!currentUser || !gameToReplace) return;
          
          try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            
            // Update the game being replaced with the selected game's data
            const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${gameToReplace.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: game.title,
                type: game.type,
                questions: game.questions || null,
                pairs: game.pairs || null,
                settings: game.settings || {},
                rewards: game.rewards || null,
                hasReward: game.hasReward || false,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Game replaced successfully:', result.game);
              // Force refresh games list
              await fetchGames();
              // Small delay to ensure state updates
              setTimeout(() => {
                setSelectedGameType(null);
                setCurrentGameType(null);
                setGameToReplace(null);
              }, 100);
            } else {
              const error = await response.json();
              setModal({
                isOpen: true,
                message: error.error || 'Failed to replace game',
                type: 'error',
              });
            }
          } catch (error) {
            console.error('Error replacing game:', error);
            setModal({
              isOpen: true,
              message: 'Failed to replace game. Please try again.',
              type: 'error',
            });
          }
        }}
        onBack={() => {
          setSelectedGameType(null);
          setShowGameTypeSelection(true);
        }}
      />
    );
  }

  if (showCreateFlow) {
    return (
      <GameCreationFlow
        onBack={() => setShowCreateFlow(false)}
        onGameCreated={handleGameCreated}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-pink-300/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 40}px`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
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
      <div className="sticky top-0 w-full z-40 overflow-hidden shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative py-6 md:py-8 lg:py-10 px-4 md:px-8"
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(135deg, rgb(244, 63, 94) 0%, rgb(236, 72, 153) 50%, rgb(168, 85, 247) 100%)',
                'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(168, 85, 247) 50%, rgb(244, 63, 94) 100%)',
                'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(244, 63, 94) 50%, rgb(236, 72, 153) 100%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.8, 1.4, 0.8],
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
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white/70"
              >
                <path
                  d="M5 0L6.5 3.5L10 5L6.5 6.5L5 10L3.5 6.5L0 5L3.5 3.5L5 0Z"
                  fill="currentColor"
                  opacity="0.8"
                />
              </svg>
            </motion.div>
          ))}

          <div className="relative max-w-7xl mx-auto flex items-center justify-between">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white shadow-lg flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Centered title - absolute positioning for desktop */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden md:block">
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow mb-2 flex items-center justify-center gap-2 whitespace-nowrap">
                Games
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
                  🎮
                </motion.span>
              </h1>
              <p className="text-base lg:text-lg text-white/90 font-serif whitespace-nowrap">
                Create fun games and challenges for your loved one
              </p>
            </div>

            {/* Mobile title - shown only on mobile */}
            <div className="text-center flex-1 md:hidden">
              <h1 className="text-2xl font-serif font-bold text-white drop-shadow mb-2 flex items-center justify-center gap-2">
                Games
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
                  🎮
                </motion.span>
              </h1>
              <p className="text-sm text-white/90 font-serif">
                Create fun games and challenges for your loved one
              </p>
            </div>

            {/* Create Game button - right side on desktop */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {games.length > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateFlow(true)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-serif font-semibold shadow-lg"
                >
                  Create Game
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-serif text-lg">Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
              No Games Yet
            </h2>
            <p className="text-gray-600 font-serif mb-6">
              Create your first game to surprise your loved one!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateFlow(true)}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg"
            >
              Create Your First Game
            </motion.button>
          </motion.div>
        ) : (
          <>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {(fromExtras ? games.filter(game => game.letterId) : games).map((game, index) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setManagingGame(game)}
                  className="bg-white rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-rose-200 flex flex-col gap-3 md:gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-3xl md:text-4xl">
                      {game.type === 'quiz' ? '❓' : '🧠'}
                    </div>
                    {game.hasReward && (
                      <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <span>🎁</span>
                        <span>Reward</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-serif font-bold text-gray-800">
                      {game.title || game.name}
                    </h3>
                    <p className="text-gray-600 font-serif text-xs md:text-sm">
                      Type: {game.type === 'quiz' ? 'Quiz Game' : 'Memory Match'}
                    </p>
                    {game.hasReward ? (
                      <p className="text-pink-600 font-serif text-xs md:text-sm mt-2 flex items-center gap-2">
                        🎁 Mystery rewards ready
                      </p>
                    ) : (
                      <p className="text-gray-400 font-serif text-xs md:text-sm mt-2">
                        No rewards yet
                      </p>
                    )}
                  </div>

                  <p className="text-gray-400 text-xs font-serif mt-auto">
                    Created {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Create Game button under cards - mobile only, only if games exist */}
            {games.length > 0 && (
              <div className="md:hidden mt-6">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateFlow(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg"
                >
                  Create Game
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {managingGame && (
          <GameDetailsModal
            game={managingGame}
            onClose={() => setManagingGame(null)}
            onEditGame={() => {
              setCurrentGameType(managingGame.type); // Store the current game type
              setGameToReplace(managingGame); // Store the game being replaced
              setManagingGame(null);
              setShowGameTypeSelection(true);
            }}
            onEditQuiz={() => {
              setEditingQuizGame(managingGame);
              setManagingGame(null);
            }}
            onEditRewards={() => {
              setEditingRewardsGame({
                game: managingGame,
                mode: managingGame.hasReward ? 'edit' : 'create',
              });
              setManagingGame(null);
            }}
            onDelete={() => handleDeleteGame(managingGame)}
            onShowCompletionStatus={() => {
              setCompletionStatusGame(managingGame);
              setShowCompletionStatus(true);
              setManagingGame(null); // Close the details modal
            }}
          />
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <MessageModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
        message={modal.message}
        type={modal.type}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDeleteGame}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setGameToDelete(null);
        }}
        isLoading={false}
        icon="🗑️"
        title="Delete Game?"
        message={gameToDelete ? `Are you sure you want to delete "${gameToDelete.title || gameToDelete.name}"? This action cannot be undone.` : ''}
      />

      {/* Completion Status Modal */}
      {showCompletionStatus && completionStatusGame && (
        <CompletionStatusModal
          game={completionStatusGame}
          onClose={() => {
            setShowCompletionStatus(false);
            setCompletionStatusGame(null);
          }}
        />
      )}
    </div>
  );
}

function CompletionStatusModal({ game, onClose }) {
  const [completionData, setCompletionData] = useState(null);
  const [loadingCompletion, setLoadingCompletion] = useState(true);
  const [fulfilled, setFulfilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState(null);
  const [claimedReward, setClaimedReward] = useState(null);
  const [showConfirmFulfill, setShowConfirmFulfill] = useState(false);
  const [showEmailCustomization, setShowEmailCustomization] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCompletionData = async () => {
      if (!currentUser || !game.id) return;
      setLoadingCompletion(true);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${game.id}/completion`);
        if (response.ok) {
          const data = await response.json();
          setCompletionData(data);
          setFulfilled(data.rewardFulfilled || false);
          
          // Find the claimed reward
          if (data.claimedRewardId && game.rewards && Array.isArray(game.rewards)) {
            // Try to find reward by matching claimedRewardId
            const foundReward = game.rewards.find((r, idx) => {
              // Check various ID formats
              return r.id === data.claimedRewardId || 
                     r._id === data.claimedRewardId ||
                     `reward_index_${idx}` === data.claimedRewardId ||
                     idx.toString() === data.claimedRewardId ||
                     (typeof data.claimedRewardId === 'string' && data.claimedRewardId.includes(idx.toString()));
            });
            
            if (foundReward) {
              setClaimedReward(foundReward);
            } else {
              // Fallback: try to parse index from claimedRewardId
              const indexMatch = data.claimedRewardId.match(/(\d+)/);
              if (indexMatch) {
                const idx = parseInt(indexMatch[1], 10);
                if (game.rewards[idx]) {
                  setClaimedReward(game.rewards[idx]);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching completion data:', error);
      } finally {
        setLoadingCompletion(false);
      }
    };

    const fetchReceiverEmail = async () => {
      if (!currentUser) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/receiver-data/${currentUser.uid}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.email) {
            setReceiverEmail(result.data.email);
          }
        }
      } catch (error) {
        console.error('Error fetching receiver email:', error);
      }
    };

    if (game.hasReward) {
      fetchCompletionData();
      fetchReceiverEmail();
    }
  }, [currentUser, game.id, game.hasReward, game.rewards]);

  const handleMarkFulfilled = () => {
    // Show confirmation popup
    setShowConfirmFulfill(true);
  };

  const handleConfirmFulfill = () => {
    setShowConfirmFulfill(false);
    // Show email customization modal
    setShowEmailCustomization(true);
    // Set default email message
    const rewardName = claimedReward?.name || 'your reward';
    setEmailMessage(`I've fulfilled your reward: ${rewardName}! I can't wait to share this special moment with you 💝`);
  };

  const handleCancelFulfill = () => {
    setShowConfirmFulfill(false);
  };

  const handleSendFulfilledEmail = async () => {
    if (!currentUser || !game.id || saving || sendingEmail) return;
    setSendingEmail(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const finalMessage = emailMessage.trim() || `I've fulfilled your reward! I can't wait to share this special moment with you 💝`;
      
      // Update fulfillment status and send email
      const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${game.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardFulfilled: true,
          emailToReceiver: true,
          emailMessage: finalMessage,
          receiverEmail: receiverEmail,
        }),
      });
      
      if (response.ok) {
        setFulfilled(true);
        setShowEmailCustomization(false);
        setEmailMessage('');
        // Refresh completion data
        const refreshResponse = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${game.id}/completion`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCompletionData(data);
        }
        // Trigger refresh event so other components can update
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('refreshGames'));
        }
      } else {
        console.error('Failed to update fulfillment status and send email');
        alert('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error updating fulfillment status:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCancelEmail = () => {
    setShowEmailCustomization(false);
    setEmailMessage('');
  };

  const getRewardTypeIcon = (type) => {
    if (type === 'food-drink') return '🍕';
    if (type === 'date-outing') return '🎬';
    if (type === 'emotional-digital') return '💌';
    return '🎁';
  };

  const getRewardTypeName = (type) => {
    if (type === 'food-drink') return 'Food / Drink';
    if (type === 'date-outing') return 'Date / Outing';
    if (type === 'emotional-digital') return 'Emotional / Digital Gift';
    return 'Reward';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-8 pt-8 pb-6 border-b border-gray-100">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              ×
            </button>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mb-2">
                Game Completion Status 💌
              </h3>
              <p className="text-gray-500 font-serif text-sm">
                {game.title || 'Untitled Game'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .overflow-y-auto::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {loadingCompletion ? (
              <div className="text-center py-4">
                <p className="text-gray-500 font-serif">Loading...</p>
              </div>
            ) : completionData && completionData.completed ? (
              <div className="space-y-4">
                {completionData.passed ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">✅</span>
                      <p className="font-serif font-semibold text-green-800">
                        Game Completed Successfully!
                      </p>
                    </div>
                    <p className="text-sm text-green-700 font-serif">
                      Status: <span className="font-semibold">Passed</span>
                      {completionData.score && (
                        <span className="ml-2">(Score: {completionData.score}%)</span>
                      )}
                    </p>
                    {completionData.completedAt && (
                      <p className="text-xs text-green-600 font-serif mt-1">
                        Completed on: {new Date(completionData.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💪</span>
                      <p className="font-serif font-semibold text-orange-800">
                        Game Attempted
                      </p>
                    </div>
                    <p className="text-sm text-orange-700 font-serif">
                      Status: <span className="font-semibold">Failed</span>
                      {completionData.score && (
                        <span className="ml-2">(Score: {completionData.score}%)</span>
                      )}
                    </p>
                    {completionData.completedAt && (
                      <p className="text-xs text-orange-600 font-serif mt-1">
                        Attempted on: {new Date(completionData.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Reward Information */}
                {completionData.passed && claimedReward && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
                    <p className="text-sm font-serif font-semibold text-purple-800 mb-3">
                      Chosen Reward
                    </p>
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-3xl">{getRewardTypeIcon(claimedReward.type)}</span>
                      <div className="flex-1">
                        <p className="text-xs font-serif uppercase tracking-wide text-purple-600 mb-1">
                          {getRewardTypeName(claimedReward.type)}
                        </p>
                        <p className="text-lg font-serif font-semibold text-gray-800">
                          {claimedReward.name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Reward Status */}
                    <div className="flex items-center justify-between pt-3 border-t border-purple-200">
                      <div>
                        <p className="text-sm font-serif font-semibold text-purple-800 mb-1">
                          Status
                        </p>
                        <p className="text-xs text-purple-600 font-serif">
                          {fulfilled ? 'Reward has been fulfilled in real life' : 'Waiting to be fulfilled'}
                        </p>
                      </div>
                      {!fulfilled && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleMarkFulfilled}
                          disabled={saving}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full font-serif font-semibold text-sm shadow-lg transition-all"
                        >
                          Mark as Fulfilled ✓
                        </motion.button>
                      )}
                      {fulfilled && (
                        <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-serif font-semibold text-sm shadow-lg">
                          ✓ Fulfilled
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                <p className="text-gray-500 font-serif text-sm">
                  Game not completed yet. Waiting for receiver to play and claim reward...
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full font-serif font-semibold text-base shadow-lg transition-all"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmFulfill && (
          <ConfirmationModal
            isOpen={showConfirmFulfill}
            onConfirm={handleConfirmFulfill}
            onCancel={handleCancelFulfill}
            isLoading={false}
            icon="✓"
            title="Mark Reward as Fulfilled?"
            message={`Have you fulfilled the reward "${claimedReward?.name || 'this reward'}" in real life? This will send an email notification to the receiver.`}
          />
        )}
      </AnimatePresence>

      {/* Email Customization Modal */}
      <AnimatePresence>
        {showEmailCustomization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={handleCancelEmail}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="relative px-8 pt-8 pb-6 border-b border-gray-100">
                <button
                  onClick={handleCancelEmail}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mb-2">
                    Customize Email Message 💌
                  </h3>
                  <p className="text-gray-500 font-serif text-sm">
                    Personalize the email that will be sent to notify about the fulfilled reward
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-serif font-semibold text-gray-700 mb-2">
                    Email Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="I've fulfilled your reward! I can't wait to share this special moment with you 💝"
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-serif resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-serif">
                    This message will be sent to {receiverEmail || 'the receiver'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelEmail}
                  disabled={sendingEmail}
                  className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-serif font-semibold text-base transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendFulfilledEmail}
                  disabled={sendingEmail}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full font-serif font-semibold text-base shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? 'Sending...' : 'Send Email & Mark Fulfilled'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GameSelectionScreen({ games, gameType, onSelectGame, onBack }) {
  const gameTypeName = gameType === 'quiz' ? 'Quiz Games' : 'Memory Match Games';
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-pink-300/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 40}px`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
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
      <div className="sticky top-0 w-full z-50 overflow-hidden shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative py-6 md:py-8 px-4 md:px-8"
        >
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
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-serif font-bold text-white drop-shadow-lg text-center"
            >
              Select {gameTypeName} to Edit ✏️
            </motion.h1>

            <div className="w-12" /> {/* Spacer for centering */}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        {games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
              No Games Available
            </h2>
            <p className="text-gray-600 font-serif">
              Create a game first to edit it.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 text-center mb-2">
                Choose a {gameTypeName.slice(0, -1)} to Edit
              </h2>
              <p className="text-gray-600 text-center font-serif italic">
                Select a game from your {gameTypeName.toLowerCase()}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(fromExtras ? games.filter(game => game.letterId) : games).map((game, index) => {
                const gameIcon = game.type === 'quiz' ? '❓' : '🧠';
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelectGame(game)}
                      className="w-full bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-rose-200 flex flex-col gap-4 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-4xl">{gameIcon}</div>
                        {game.hasReward && (
                          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <span>🎁</span>
                            <span>Reward</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-serif font-bold text-gray-800">
                          {game.title || game.name}
                        </h3>
                        <p className="text-gray-600 font-serif text-sm">
                          Type: {game.type === 'quiz' ? 'Quiz Game' : 'Memory Match'}
                        </p>
                        {game.hasReward ? (
                          <p className="text-pink-600 font-serif text-sm mt-2 flex items-center gap-2">
                            🎁 Mystery rewards ready
                          </p>
                        ) : (
                          <p className="text-gray-400 font-serif text-sm mt-2">
                            No rewards yet
                          </p>
                        )}
                      </div>

                      <p className="text-gray-400 text-xs font-serif mt-auto">
                        Created {new Date(game.createdAt).toLocaleDateString()}
                      </p>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GameDetailsModal({ game, onClose, onEditGame, onEditQuiz, onEditRewards, onDelete, onShowCompletionStatus }) {
  const [completionData, setCompletionData] = useState(null);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCompletionData = async () => {
      if (!currentUser || !game.id) return;
      setLoadingCompletion(true);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}/${game.id}/completion`);
        if (response.ok) {
          const data = await response.json();
          setCompletionData(data);
        }
      } catch (error) {
        console.error('Error fetching completion data:', error);
      } finally {
        setLoadingCompletion(false);
      }
    };

    if (game.hasReward) {
      fetchCompletionData();
    }
  }, [currentUser, game.id, game.hasReward]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl md:rounded-3xl max-w-2xl w-full shadow-2xl max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header with logo, title, and game type centered */}
        <div className="relative px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-6 md:right-6 text-gray-400 hover:text-gray-600 transition-colors text-xl md:text-2xl w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            ×
          </button>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="text-4xl md:text-6xl mb-2 md:mb-3"
            >
              {game.type === 'quiz' ? '❓' : '🧠'}
            </motion.div>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-gray-800 mb-1 md:mb-2 px-2">
              {game.title || 'Untitled Game'}
            </h3>
            <p className="text-gray-500 font-serif text-xs md:text-sm lg:text-base">
              {game.type === 'quiz' ? 'Quiz Game' : 'Memory Match'}
            </p>
            {game.isCompleted && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-green-600 font-serif text-xs md:text-sm mt-2 md:mt-3 flex items-center justify-center gap-2"
              >
                <span>✅</span>
                <span>Completed</span>
              </motion.p>
            )}
          </div>
        </div>

        {/* Scrollable content area with hidden scrollbar */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>


        {game.hasReward ? (
          <div>
            <h4 className="text-base md:text-lg font-serif font-semibold text-gray-800 mb-2 md:mb-3">
              Mystery Rewards
            </h4>
            <div className="space-y-2 md:space-y-3">
              {game.rewards?.map((reward, idx) => (
                <div
                  key={idx}
                  className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50"
                >
                  <p className="text-xs md:text-sm font-serif uppercase tracking-wide text-gray-500">
                    Choice {idx + 1} · {reward.typeName || 'Reward'}
                  </p>
                  <p className="text-base md:text-lg font-serif font-semibold text-gray-800 mt-1">
                    {reward.name}
                  </p>
                  {reward.description && (
                    <p className="text-xs md:text-sm text-gray-600 font-serif mt-1">
                      {reward.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs md:text-sm text-gray-500 font-serif">
              No rewards added yet. Add three mystery rewards to surprise your receiver.
            </p>
          </div>
        )}

        </div>

        {/* Footer with action buttons */}
        <div className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-100 bg-gray-50 space-y-2 md:space-y-3">
          {/* Primary Edit Button - Opens game selection */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditGame}
            className="w-full px-4 md:px-6 py-3 md:py-4 text-sm md:text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-serif font-semibold shadow-lg transition-all"
          >
            ✏️ Edit Game
          </motion.button>

          {/* Secondary Actions */}
          <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-3">
            {game.hasReward && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onShowCompletionStatus && onShowCompletionStatus()}
                className="w-full md:flex-1 md:min-w-[140px] px-4 py-2.5 md:py-3 text-xs md:text-sm bg-purple-100 text-purple-700 rounded-full font-serif font-semibold shadow-sm"
              >
                📊 Completion Status
              </motion.button>
            )}
            {game.type === 'quiz' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEditRewards}
                className="w-full md:flex-1 md:min-w-[140px] px-4 py-2.5 md:py-3 text-xs md:text-sm bg-pink-100 text-pink-700 rounded-full font-serif font-semibold shadow-sm"
              >
                {game.hasReward ? '🎁 Edit Rewards' : '🎁 Add Rewards'}
              </motion.button>
            )}
            {game.type === 'memory-match' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEditRewards}
                className="w-full md:flex-1 md:min-w-[140px] px-4 py-2.5 md:py-3 text-xs md:text-sm bg-pink-100 text-pink-700 rounded-full font-serif font-semibold shadow-sm"
              >
                {game.hasReward ? '🎁 Edit Rewards' : '🎁 Add Rewards'}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="w-full md:flex-1 md:min-w-[140px] px-4 py-2.5 md:py-3 text-xs md:text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full font-serif font-semibold shadow-lg transition-all"
            >
              🗑️ Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

