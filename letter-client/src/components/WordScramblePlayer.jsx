// WordScramblePlayer.jsx - Play word scramble game
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RewardFlow from './RewardFlow';
import GameCompletionScreen from './GameCompletionScreen';

// Function to scramble a word
// Note: Single-letter words will remain unchanged (they can't be scrambled)
function scrambleWord(word) {
  const letters = word.split('');
  // For single-letter words, the loop condition (i > 0) fails, so they stay as-is
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join('').toUpperCase();
}

export default function WordScramblePlayer({ game, userId, letterId, onComplete, onBack, gameId }) {
  const [wordAnswers, setWordAnswers] = useState({}); // { index: "user answer" }
  const [gameComplete, setGameComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRewardFlow, setShowRewardFlow] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [showPhraseModal, setShowPhraseModal] = useState(false);
  const [error, setError] = useState({}); // { index: true } for individual word errors
  const inputRefs = useRef({}); // { index: inputRef } for auto-focusing

  const words = game?.words || [];
  // Use phrase from game if available, otherwise reconstruct from words
  const originalPhrase = game?.phrase || game?.originalPhrase || words.join(' ');
  
  // Memoize background elements BEFORE any conditional returns (Rules of Hooks)
  const backgroundHearts = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      const rand4 = Math.random();
      const rand5 = Math.random();
      return {
        id: i,
        left: rand1 * 100,
        top: rand2 * 100,
        fontSize: 20 + rand3 * 40,
        duration: 8 + rand4 * 4,
        delay: rand5 * 2,
      };
    });
  }, []);

  const backgroundStars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
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
  }, []);

  const backgroundHeartsMemo = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `heart-${i}`,
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 80,
      fontSize: 12 + Math.random() * 20,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);
  
  // Initialize word answers state
  useEffect(() => {
    const initialAnswers = {};
    words.forEach((word, index) => {
      if (word && word.length > 1) {
        // Only scrambled words (length > 1) need answers
        initialAnswers[index] = '';
      }
    });
    setWordAnswers(initialAnswers);
  }, [words]);
  
  // Get scrambled words and identify which words need to be unscrambled
  const gameWords = useMemo(() => {
    if (!words || words.length === 0) return [];
    
    return words
      .filter(word => word != null && word !== undefined && word !== '' && typeof word === 'string')
      .map((word, index) => {
        const trimmed = String(word).trim();
        const needsScrambling = trimmed.length > 1;
        return {
          original: trimmed,
          scrambled: needsScrambling ? scrambleWord(trimmed) : trimmed.toUpperCase(),
          index: index,
          needsAnswer: needsScrambling, // Only words with length > 1 need answers
        };
      });
  }, [words]);

  // Check if all answers are filled
  const allAnswersFilled = useMemo(() => {
    return gameWords
      .filter(word => word.needsAnswer)
      .every(word => wordAnswers[word.index] && wordAnswers[word.index].trim().length > 0);
  }, [gameWords, wordAnswers]);

  // Check if all words are correctly answered
  const allWordsCorrect = useMemo(() => {
    return gameWords
      .filter(word => word.needsAnswer)
      .every(word => {
        const userAnswer = (wordAnswers[word.index] || '').trim().toLowerCase();
        const correctAnswer = word.original.toLowerCase();
        return userAnswer === correctAnswer;
      });
  }, [gameWords, wordAnswers]);

  // Handle individual word answer change
  const handleWordAnswerChange = (index, value) => {
    setWordAnswers(prev => ({
      ...prev,
      [index]: value,
    }));
    
    // Check if this word is correct
    const word = gameWords.find(w => w.index === index);
    if (word && word.needsAnswer) {
      const userAnswer = value.trim().toLowerCase();
      const correctAnswer = word.original.toLowerCase();
      
      // Clear error if word becomes correct
      if (userAnswer === correctAnswer && error[index]) {
        setError(prev => {
          const newError = { ...prev };
          delete newError[index];
          return newError;
        });
      }
    }
  };

  // Track previous correct answers to detect when a word becomes correct
  const prevCorrectAnswers = useRef(new Set());
  
  // Auto-focus next input when a word is correctly answered
  useEffect(() => {
    const wordsNeedingAnswers = gameWords.filter(word => word.needsAnswer);
    const currentCorrectAnswers = new Set();
    
    // Build set of currently correct answers
    wordsNeedingAnswers.forEach(word => {
      const userAnswer = (wordAnswers[word.index] || '').trim().toLowerCase();
      const isCorrect = userAnswer === word.original.toLowerCase() && userAnswer.length > 0;
      if (isCorrect) {
        currentCorrectAnswers.add(word.index);
      }
    });
    
    // Find newly correct words (in current but not in previous)
    const newlyCorrect = Array.from(currentCorrectAnswers).filter(
      index => !prevCorrectAnswers.current.has(index)
    );
    
    if (newlyCorrect.length > 0) {
      // Find the first newly correct word
      const newlyCorrectIndex = newlyCorrect[0];
      const wordIndex = wordsNeedingAnswers.findIndex(w => w.index === newlyCorrectIndex);
      
      if (wordIndex >= 0) {
        // Find the next word that needs an answer
        const nextWord = wordsNeedingAnswers.find((w, idx) => 
          idx > wordIndex && 
          !(wordAnswers[w.index]?.trim().toLowerCase() === w.original.toLowerCase())
        );
        
        if (nextWord && inputRefs.current[nextWord.index]) {
          // Small delay to ensure state has updated and input is enabled
          setTimeout(() => {
            const nextInput = inputRefs.current[nextWord.index];
            if (nextInput && !nextInput.disabled) {
              nextInput.focus();
            }
          }, 150);
        }
      }
    }
    
    // Update previous correct answers
    prevCorrectAnswers.current = currentCorrectAnswers;
  }, [wordAnswers, gameWords]);

  // Validate answer on blur
  const handleWordBlur = (index) => {
    const word = gameWords.find(w => w.index === index);
    if (word && word.needsAnswer) {
      const userAnswer = (wordAnswers[index] || '').trim().toLowerCase();
      const correctAnswer = word.original.toLowerCase();
      
      if (userAnswer.length > 0 && userAnswer !== correctAnswer) {
        setError(prev => ({ ...prev, [index]: true }));
        // Clear the error after showing it
        setTimeout(() => {
          setError(prev => {
            const newError = { ...prev };
            delete newError[index];
            return newError;
          });
        }, 2000);
      }
    }
  };

  const handleGameComplete = useCallback(async (passed = true) => {
    try {
      setGameComplete(true);
      setIsSubmitting(true);
      
      const finalScore = passed ? 100 : 0;

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Mark game as completed
      if (gameId && userId) {
        const response = await fetch(`${backendUrl}/api/games/${userId}/${gameId}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            passed: passed,
            score: finalScore,
          }),
        });

        if (response.ok && passed) {
          // Only show reward flow if game has rewards configured
          const hasRewards = game?.hasReward === true && game?.rewards && Array.isArray(game.rewards) && game.rewards.length > 0;
          
          if (hasRewards) {
            setShowRewardFlow(true);
          } else {
            // No rewards, go directly to completion screen
            setShowCompletionScreen(true);
          }
        } else if (response.ok) {
          setShowCompletionScreen(true);
        } else {
          setShowCompletionScreen(true);
        }
      } else {
        setShowCompletionScreen(true);
      }
    } catch (error) {
      console.error('Error completing game:', error);
      setShowCompletionScreen(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [gameId, userId, game]);

  // Auto-complete when all words are correctly identified
  useEffect(() => {
    const wordsNeedingAnswers = gameWords.filter(word => word.needsAnswer);
    if (wordsNeedingAnswers.length > 0 && allWordsCorrect && !gameComplete && !isSubmitting && !showPhraseModal) {
      // Small delay to show the completed phrase, then show modal
      const timer = setTimeout(() => {
        setShowPhraseModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [allWordsCorrect, gameComplete, gameWords, isSubmitting, showPhraseModal, allAnswersFilled]);

  const handleRewardSelected = async (rewardId) => {
    if (!gameId || !userId) return;
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await fetch(`${backendUrl}/api/games/${userId}/${gameId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId: rewardId,
        }),
      });
      
      setShowRewardFlow(false);
      setShowCompletionScreen(true);
    } catch (error) {
      console.error('Error selecting reward:', error);
    }
  };

  // Handle phrase modal continue - proceed directly to completion screen (skip loading)
  const handlePhraseModalContinue = useCallback(async () => {
    setShowPhraseModal(false);
    setGameComplete(true);
    
    // Mark game as completed in the background (don't wait for it)
    if (gameId && userId) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      fetch(`${backendUrl}/api/games/${userId}/${gameId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passed: true,
          score: 100,
        }),
      }).catch(err => console.error('Error completing game:', err));
    }
    
    // Immediately show the appropriate screen without loading state
    const hasRewards = game?.hasReward === true && game?.rewards && Array.isArray(game.rewards) && game.rewards.length > 0;
    if (hasRewards) {
      setShowRewardFlow(true);
    } else {
      setShowCompletionScreen(true);
    }
  }, [gameId, userId, game]);

  // Only show reward flow if rewards are actually configured
  const hasRewards = game?.hasReward === true && game?.rewards && Array.isArray(game.rewards) && game.rewards.length > 0;

  // Show phrase modal when all words are correct
  if (showPhraseModal) {
    return (
      <div className="h-full w-full relative overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
        {/* Background */}
        <div className="fixed inset-0 bg-[#1a1a2e] z-0" />
        <motion.div
          className="fixed inset-0 z-0"
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
        
        {/* Modal */}
        <AnimatePresence>
          <motion.div
            key="phrase-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#2d1b4e]/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 max-w-2xl w-full"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-5xl mb-4"
                >
                  ✨
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-serif text-white mb-2"
                >
                  You unscrambled it!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 font-serif text-sm md:text-base"
                >
                  Here's the complete phrase:
                </motion.p>
              </div>

              {/* Phrase Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 mb-6"
              >
                <p className="text-xl md:text-2xl lg:text-3xl font-serif text-white text-center leading-relaxed whitespace-pre-wrap">
                  {originalPhrase}
                </p>
              </motion.div>

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePhraseModalContinue}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold text-lg shadow-lg"
                >
                  Continue
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Show loading state only when game is complete and being submitted
  // Don't show loading when all words are correct - let the phrase modal show instead
  if ((gameComplete || isSubmitting) && !showRewardFlow && !showCompletionScreen && !showPhraseModal) {
    return (
      <div className="h-full w-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="fixed inset-0 bg-[#1a1a2e] z-0" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center relative z-10"
        >
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-white font-serif text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (showRewardFlow && hasRewards) {
    return (
      <RewardFlow
        game={game}
        rewards={game.rewards}
        userId={userId}
        letterId={letterId}
        gameId={gameId}
        gameType="word-scramble"
        onRewardSelected={handleRewardSelected}
        onBack={() => {
          // Go back to completion screen if user clicks back
          setShowRewardFlow(false);
        }}
        onComplete={() => {
          // Reward flow complete - go back to OptionsPage
          setShowRewardFlow(false);
          if (onComplete) {
            onComplete({ score: gameComplete ? 100 : 0, passed: gameComplete });
          }
          if (onBack) onBack();
        }}
      />
    );
  }

  if (showCompletionScreen) {
    return (
      <GameCompletionScreen
        score={gameComplete ? 100 : 0}
        hasRewards={hasRewards}
        onClaimReward={hasRewards ? () => {
          // Only show reward flow if rewards are actually configured
          setShowCompletionScreen(false);
          setShowRewardFlow(true);
        } : undefined}
        onMaybeLater={() => {
          if (onComplete) onComplete({ score: gameComplete ? 100 : 0, passed: gameComplete });
          // Go back to OptionsPage
          if (onBack) onBack();
        }}
      />
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className="text-6xl mb-4">🔤</div>
          <p className="text-gray-600 font-serif text-lg">No words available in this game.</p>
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-serif font-semibold"
            >
              Go Back
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-y-auto overflow-x-hidden">
      {/* Background matching OptionsPage */}
      <motion.div
        className="fixed inset-0"
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
      <div className="fixed inset-0 pointer-events-none">
        {backgroundStars.map((star) => (
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
      </div>

      {/* Floating Hearts */}
      <div className="fixed inset-0 pointer-events-none">
        {backgroundHeartsMemo.map((heart) => (
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
      </div>

      {/* Soft Glow Effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Back Button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="fixed top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}

      {/* Game Content with Glassmorphism */}
      <div className="relative z-10 w-full flex items-start justify-center p-4 py-8 md:py-12 min-h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 lg:p-12 max-w-4xl w-full my-4 md:my-8"
        >
        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
            Word Scramble 🔤
          </h2>
          <p className="text-white/80 font-serif text-sm md:text-base">
            Unscramble each word below to reveal the hidden phrase above
          </p>
        </div>

        {/* Phrase Display - Shows full scrambled phrase, updates as words are correctly unscrambled */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 border border-white/20"
          >
            <p className="text-sm font-serif text-white/80 mb-4">Unscramble the phrase:</p>
            <div className="text-xl md:text-2xl lg:text-3xl font-serif text-white flex flex-wrap justify-center items-center gap-2 md:gap-3">
              {gameWords.map((word, idx) => {
                const isLast = idx === gameWords.length - 1;
                const userAnswer = wordAnswers[word.index] || '';
                const isCorrect = word.needsAnswer 
                  ? userAnswer.trim().toLowerCase() === word.original.toLowerCase()
                  : true;
                
                // Show unscrambled word if correct, otherwise show scrambled version
                const displayWord = word.needsAnswer && isCorrect && userAnswer.trim()
                  ? word.original.toUpperCase()
                  : word.scrambled;
                
                return (
                  <React.Fragment key={word.index}>
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0.8 }}
                      animate={{ 
                        scale: isCorrect && word.needsAnswer && userAnswer.trim() ? 1.1 : 1,
                        opacity: 1
                      }}
                      transition={{ duration: 0.3 }}
                      className={`inline-block font-bold px-2 py-1 ${
                        isCorrect && word.needsAnswer && userAnswer.trim()
                          ? 'text-green-400'
                          : 'text-white'
                      }`}
                    >
                      {displayWord}
                    </motion.span>
                    {!isLast && <span className="text-white/50 mx-1">·</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Scrambled Words with Input Fields */}
        <div className="mb-6">
          <label className="block text-sm md:text-base font-serif font-semibold text-white mb-4 text-center">
            Unscramble each word:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameWords
              .filter(word => word.needsAnswer)
              .map((word) => {
                const userAnswer = wordAnswers[word.index] || '';
                const isCorrect = userAnswer.trim().toLowerCase() === word.original.toLowerCase();
                const showError = error[word.index];
                
                return (
                  <motion.div
                    key={word.index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      x: showError ? [0, -10, 10, -10, 10, 0] : 0
                    }}
                    transition={showError ? { duration: 0.5 } : { delay: word.index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-center mb-2">
                      <p className="text-sm font-serif text-white/70 mb-1">Scrambled:</p>
                      <motion.div
                        className={`text-xl md:text-2xl lg:text-3xl font-mono font-bold tracking-wider ${
                          showError ? 'text-red-400' : isCorrect ? 'text-green-400 line-through' : 'text-white'
                        }`}
                      >
                        {word.scrambled}
                      </motion.div>
                    </div>
                    <input
                      ref={(el) => {
                        if (el) {
                          inputRefs.current[word.index] = el;
                        }
                      }}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => handleWordAnswerChange(word.index, e.target.value)}
                      onBlur={() => handleWordBlur(word.index)}
                      placeholder="Type answer..."
                      disabled={isCorrect && userAnswer.trim()}
                      className={`w-full px-4 py-3 text-center text-base md:text-lg font-serif border-2 rounded-xl focus:outline-none transition-all bg-white/10 backdrop-blur-sm text-white placeholder-white/50 ${
                        showError
                          ? 'border-red-400 bg-red-500/20'
                          : isCorrect && userAnswer.trim()
                          ? 'border-green-400 bg-green-500/20 cursor-not-allowed'
                          : 'border-white/30 focus:border-pink-400'
                      }`}
                      autoComplete="off"
                    />
                    {showError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs font-serif mt-1"
                      >
                        Try again!
                      </motion.p>
                    )}
                    {isCorrect && userAnswer.trim() && !showError && (
                      <motion.p
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-green-400 text-xs font-serif mt-1"
                      >
                        ✓ Correct!
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Progress Indicator */}
        {gameWords.filter(w => w.needsAnswer).length > 0 && (
          <div className="mb-4 md:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm md:text-base font-serif text-white/80">
                Progress: {gameWords.filter(w => w.needsAnswer && (wordAnswers[w.index] || '').trim().toLowerCase() === w.original.toLowerCase()).length} / {gameWords.filter(w => w.needsAnswer).length} words
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(gameWords.filter(w => w.needsAnswer && (wordAnswers[w.index] || '').trim().toLowerCase() === w.original.toLowerCase()).length / gameWords.filter(w => w.needsAnswer).length) * 100}%`
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
              />
            </div>
            {allWordsCorrect && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-green-400 font-serif font-semibold mt-2"
              >
                🎉 All words correct! Redirecting...
              </motion.p>
            )}
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
}
