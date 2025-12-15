// GameCreationFlow.jsx - Orchestrates game creation flow with reward setup
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GameTypeSelection from './GameTypeSelection';
import RewardSetup from './RewardSetup';
import LoveQuizCreator from './LoveQuizCreator';
import MessageModal from '../components/MessageModal.jsx';

export default function GameCreationFlow({ onBack, onGameCreated, fromExtras = false, editGame = null }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('gameType'); // gameType -> gameSetup -> rewardPrompt -> rewardSetup -> complete
  const [gameType, setGameType] = useState(null); // 'quiz' or 'memory-match'
  const [gameData, setGameData] = useState(null); // Store game setup data
  const [wantsReward, setWantsReward] = useState(null); // true/false/null
  const [rewardData, setRewardData] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'error' });
  const [existingGames, setExistingGames] = useState([]);

  // Fetch existing games to filter out game types
  useEffect(() => {
    const fetchGames = async () => {
      if (!currentUser) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          setExistingGames(data.games || []);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, [currentUser]);

  // If editGame is provided (from extras), pre-populate the form but stay on game type selection
  useEffect(() => {
    if (editGame && fromExtras) {
      setGameType(editGame.type);
      setGameData({
        title: editGame.title,
        questions: editGame.questions,
        pairs: editGame.pairs,
        settings: editGame.settings,
      });
      setWantsReward(editGame.hasReward ? true : false);
      setRewardData(editGame.rewards || null);
      
      // Stay on game type selection screen so user can see and proceed from there
      setStep('gameType');
    }
  }, [editGame, fromExtras]);

  const handleGameTypeSelected = (type) => {
    setGameType(type);
    if (type === 'memory-match') {
      // Preserve existing gameData if editing, otherwise create new
      if (!editGame || !gameData) {
        setGameData({
          title: 'Memory Match',
          pairs: null,
          settings: {},
        });
      }
      setStep('rewardPrompt');
    } else {
      // Quiz games need setup
      setStep('gameSetup');
    }
  };

  const handleGameSetupComplete = (data) => {
    setGameData(data);
    setStep('rewardPrompt');
  };

  const handleRewardPromptResponse = (response) => {
    setWantsReward(response);
    if (response) {
      setStep('rewardSetup');
    } else {
      // Skip reward and complete game creation
      handleGameComplete(null);
    }
  };

  const handleRewardSetupComplete = (rewards) => {
    setRewardData(rewards);
    handleGameComplete(rewards);
  };

  const handleGameComplete = async (rewards) => {
    if (!currentUser) return;

    // Combine game data with rewards and save
    const finalGameData = {
      ...gameData,
      type: gameType,
      rewards: rewards || null,
      hasReward: !!rewards,
    };

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const endpoint = editGame 
        ? `${backendUrl}/api/games/${currentUser.uid}/${editGame.id}`
        : `${backendUrl}/api/games/${currentUser.uid}`;
      
      const response = await fetch(endpoint, {
        method: editGame ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalGameData),
      });

      if (response.ok) {
        // Call parent callback to refresh games list
        if (onGameCreated) {
          onGameCreated();
        }
        // If came from extras, navigate back
        if (fromExtras && onBack) {
          setTimeout(() => onBack(), 500);
        }
      } else {
        const error = await response.json();
        setModal({
          isOpen: true,
          message: error.error || 'Unknown error',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving game:', error);
      setModal({
        isOpen: true,
        message: 'Failed to save game. Please try again.',
        type: 'error',
      });
    }
  };

  // Get available game types (filter out types that already exist, unless fromExtras)
  const getAvailableGameTypes = () => {
    const allTypes = ['quiz', 'memory-match'];
    // If fromExtras, allow all game types regardless of existing games
    if (fromExtras) {
      return allTypes;
    }
    // Otherwise, filter out types that already exist
    const existingTypes = existingGames.map(game => game.type);
    return allTypes.filter(type => !existingTypes.includes(type));
  };

  // Render appropriate step
  if (step === 'gameType') {
    const availableTypes = getAvailableGameTypes();
    return (
      <>
        <GameTypeSelection
          onBack={onBack}
          onSelect={handleGameTypeSelected}
          availableTypes={availableTypes.length > 0 ? availableTypes : undefined}
          isEditMode={!!editGame} // Show edit mode if editing
        />
        <MessageModal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
          message={modal.message}
          type={modal.type}
        />
      </>
    );
  }

  if (step === 'gameSetup') {
    if (gameType === 'quiz') {
      return (
        <>
          <LoveQuizCreator
            onBack={() => setStep('gameType')}
            skipSave={true}
            quizToEdit={editGame && gameType === 'quiz' ? editGame : null}
            onSaved={(quizData) => {
              handleGameSetupComplete({
                title: quizData.title,
                questions: quizData.questions,
                settings: quizData.settings,
              });
            }}
          />
          <MessageModal
            isOpen={modal.isOpen}
            onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
            message={modal.message}
            type={modal.type}
          />
        </>
      );
    } else if (gameType === 'memory-match') {
      return (
        <>
          <MemoryMatchCreator
            onBack={() => setStep('gameType')}
            onSaved={(matchData) => {
              handleGameSetupComplete({
                title: matchData.title,
                pairs: matchData.pairs,
                settings: matchData.settings,
              });
            }}
          />
          <MessageModal
            isOpen={modal.isOpen}
            onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
            message={modal.message}
            type={modal.type}
          />
        </>
      );
    }
  }

  if (step === 'rewardPrompt') {
    return (
      <>
        <RewardPrompt
          onBack={() => gameType === 'quiz' ? setStep('gameSetup') : setStep('gameType')}
          onResponse={handleRewardPromptResponse}
        />
        <MessageModal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
          message={modal.message}
          type={modal.type}
        />
      </>
    );
  }

  if (step === 'rewardSetup') {
    return (
      <>
        <RewardSetup
          onBack={() => setStep('rewardPrompt')}
          onComplete={handleRewardSetupComplete}
        />
        <MessageModal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
          message={modal.message}
          type={modal.type}
        />
      </>
    );
  }

  return (
    <>
      <MessageModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
        message={modal.message}
        type={modal.type}
      />
    </>
  );
}

// RewardPrompt component
function RewardPrompt({ onBack, onResponse }) {
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
              className="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-lg text-center"
            >
              Add Rewards? 🎁
            </motion.h1>

            <div className="w-12" /> {/* Spacer for centering */}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center"
        >
          <div className="text-7xl mb-6">🎁</div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-6">
            Would you like to add a mystery reward for the receiver if they pass the game?
          </h2>
          <p className="text-gray-600 font-serif text-lg mb-8">
            Surprise your loved one with special rewards when they complete the game successfully!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onResponse(true)}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold text-lg shadow-lg"
            >
              Yes, Add Rewards! 🎁
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onResponse(false)}
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-serif font-semibold text-lg transition-all"
            >
              No, Skip
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

