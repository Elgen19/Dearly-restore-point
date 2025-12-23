// MemoryMatch.jsx - Romantic memory matching game
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RewardFlow from './RewardFlow';
import GameCompletionScreen from './GameCompletionScreen';

const ROMANTIC_ICONS = ['💕', '💖', '💗', '💝', '💘', '💞', '💓', '💟', '🌹', '🌺', '🌸', '🌷', '🌻', '🌼', '💐', '🎁', '💌', '🎀', '✨', '⭐', '🌟', '💫', '🦋', '🐦', '🕊️', '🌙', '☀️', '🌈', '🎈', '🎊'];

const DIFFICULTY_LEVELS = {
  easy: { size: 4, pairs: 8, timeLimit: 120, scoreMultiplier: 1 },
  medium: { size: 6, pairs: 18, timeLimit: 180, scoreMultiplier: 1.5 },
  hard: { size: 8, pairs: 32, timeLimit: 240, scoreMultiplier: 2 }
};

const PRIZE_THRESHOLD = 500; // Score needed to win a prize

export default function MemoryMatch({ onBack, onPrizeWon, userId, letterId, game }) {
  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [prizeWon, setPrizeWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRewardFlow, setShowRewardFlow] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(true);

  const renderBackButton = ({ hidden = false, onClickHandler } = {}) => {
    if (!onBack || hidden) return null;
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          (onClickHandler || onBack)();
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
    );
  };

  // Memoize floating icons data
  const floatingIcons = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const fontSize = 15 + Math.random() * 30;
      const xOffset = Math.random() * 40 - 20;
      const duration = 5 + Math.random() * 4;
      const delay = Math.random() * 3;
      const iconIndex = Math.floor(Math.random() * ROMANTIC_ICONS.length);
      return {
        id: i,
        left,
        top,
        fontSize,
        xOffset,
        duration,
        delay,
        icon: ROMANTIC_ICONS[iconIndex],
      };
    });
  }, []);

  // Memoize stars data
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = Math.random() * 3 + 1;
      const duration = 2 + Math.random() * 3;
      const delay = Math.random() * 2;
      return {
        id: i,
        left,
        top,
        size,
        duration,
        delay,
      };
    });
  }, []);

  // Record game result to backend
  const recordGameResult = useCallback(async (finalScore, prizeWon) => {
    if (!userId) return;
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/game-prizes/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameType: 'memory-match',
          score: finalScore,
          difficulty: difficulty,
          prizeWon: prizeWon,
          letterId: letterId || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Game result recorded:', data);
      } else {
        console.error('❌ Failed to record game result');
      }
      
      // Mark game as completed if it has rewards and user won
      if (game?.hasReward && game?.id && prizeWon) {
        try {
          await fetch(`${backendUrl}/api/games/${userId}/${game.id}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              passed: true,
              score: finalScore,
              message: null, // Will be set when reward is claimed
            }),
          });
        } catch (error) {
          console.error('Error marking game as completed:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error recording game result:', error);
    }
  }, [userId, difficulty, letterId, game]);

  // Initialize game with selected difficulty
  const initializeGame = useCallback((level) => {
    const config = DIFFICULTY_LEVELS[level];
    const iconSet = ROMANTIC_ICONS.slice(0, config.pairs);
    const cardPairs = [...iconSet, ...iconSet];
    
    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    
    setCards(shuffled.map((icon, index) => ({
      id: index,
      icon,
      isFlipped: false,
      isMatched: false
    })));
    
    setDifficulty(level);
    setTimeRemaining(config.timeLimit);
    setMoves(0);
    setScore(0);
    setMatchedPairs([]);
    setFlippedCards([]);
    setGameStarted(true);
    setGameOver(false);
    setPrizeWon(false);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, timeRemaining]);

  // Check for match when two cards are flipped
  useEffect(() => {
    if (flippedCards.length !== 2 || isProcessing) return;

    setIsProcessing(true);
    const [first, second] = flippedCards;
    const firstCard = cards[first];
    const secondCard = cards[second];

    if (firstCard.icon === secondCard.icon) {
      // Match found!
      setTimeout(() => {
        setMatchedPairs((prev) => [...prev, firstCard.icon]);
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second
              ? { ...card, isMatched: true, isFlipped: false }
              : card
          )
        );
        setFlippedCards([]);
        setIsProcessing(false);
        
        // Calculate score: base points + time bonus + move efficiency
        const config = DIFFICULTY_LEVELS[difficulty];
        const baseScore = 50 * config.scoreMultiplier;
        const timeBonus = Math.floor(timeRemaining * 2);
        const moveBonus = Math.max(0, 100 - moves);
        const newScore = score + baseScore + timeBonus + moveBonus;
        setScore(newScore);
        
        // Check if all pairs matched
        const totalPairs = config.pairs;
        if (matchedPairs.length + 1 === totalPairs) {
          setTimeout(() => {
            setGameOver(true);
            const wonPrize = newScore >= PRIZE_THRESHOLD;
            if (wonPrize) {
              setPrizeWon(true);
            }
            
            // Record game result to backend
            if (userId) {
              recordGameResult(newScore, wonPrize);
            }
          }, 500);
        }
      }, 1000);
    } else {
      // No match
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          )
        );
        setFlippedCards([]);
        setIsProcessing(false);
        setMoves((prev) => prev + 1);
      }, 1000);
    }
  }, [flippedCards, cards, isProcessing, difficulty, matchedPairs.length, moves, score, userId, letterId, recordGameResult]);

  const handleCardClick = (cardId) => {
    if (isProcessing || gameOver) return;
    
    const card = cards[cardId];
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, cardId]);
    
    if (flippedCards.length === 0) {
      setMoves((prev) => prev + 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    if (score >= PRIZE_THRESHOLD) return 'text-green-500';
    if (score >= PRIZE_THRESHOLD * 0.7) return 'text-yellow-500';
    return 'text-gray-500';
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="h-screen w-full flex items-center justify-center relative overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
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

        {stars.map((star) => (
          <motion.div
            key={`difficulty-star-${star.id}`}
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

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingIcons.map((icon) => (
            <motion.div
              key={`difficulty-icon-${icon.id}`}
              className="absolute text-white/10"
              style={{
                left: `${icon.left}%`,
                top: `${icon.top}%`,
                fontSize: `${icon.fontSize}px`,
              }}
              animate={{
                y: [0, -100, 0],
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: icon.duration,
                repeat: Infinity,
                delay: icon.delay,
              }}
            >
              {icon.icon}
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

        {renderBackButton()}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-2xl mx-auto px-2 md:px-4 py-8 md:py-0 w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-4xl md:text-6xl mb-4 md:mb-6"
          >
            🎮
          </motion.div>
          <h1 className="text-2xl md:text-5xl font-serif text-white mb-3 md:mb-4">
            Memory Match
          </h1>
          <p className="text-white/80 font-serif text-sm md:text-lg mb-6 md:mb-8 px-2">
            Match pairs of romantic hearts and emojis!{game?.hasReward && (
              <>
                <br />
                Score {PRIZE_THRESHOLD}+ points to win a prize! 🎁
              </>
            )}
          </p>

          <div className="w-full pb-4 md:pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-md md:max-w-none mx-auto md:mx-0">
            {Object.entries(DIFFICULTY_LEVELS).map(([level, config]) => (
              <motion.button
                key={level}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => initializeGame(level)}
                  className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all w-full"
              >
                  <div className="text-2xl md:text-3xl mb-1 md:mb-2">
                  {level === 'easy' ? '🌱' : level === 'medium' ? '🌿' : '🌳'}
                </div>
                  <h3 className="text-lg md:text-xl font-serif text-white mb-1 md:mb-2 capitalize">
                  {level}
                </h3>
                  <p className="text-white/70 font-serif text-xs md:text-sm mb-1 md:mb-2">
                  {config.pairs} pairs
                </p>
                  <p className="text-white/70 font-serif text-xs md:text-sm">
                  {formatTime(config.timeLimit)} time
                </p>
                  <p className="text-white/60 font-serif text-[10px] md:text-xs mt-1 md:mt-2">
                  ×{config.scoreMultiplier} score
                </p>
              </motion.button>
            ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 p-2 sm:p-4">
      {/* Animated gradient background */}
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

      {/* Floating romantic icons background */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingIcons.map((icon) => (
          <motion.div
            key={icon.id}
            className="absolute text-white/8"
            style={{
              left: `${icon.left}%`,
              top: `${icon.top}%`,
              fontSize: `${icon.fontSize}px`,
            }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: icon.duration * 1.5,
              repeat: Infinity,
              delay: icon.delay,
              ease: [0.42, 0, 0.58, 1], // Smooth cubic bezier easing
            }}
          >
            {icon.icon}
          </motion.div>
        ))}
      </div>

      {/* Floating orbs for depth */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: `${200 + i * 150}px`,
            height: `${200 + i * 150}px`,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(236, 72, 153, 0.3))'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(139, 92, 246, 0.3))',
          }}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Sparkling stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {renderBackButton({ hidden: gameOver })}

      <div 
        className="relative z-10 w-full max-w-4xl max-h-[95vh] overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
        
        {/* Game title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-2">
            Memory Match 🎮
          </h1>
          <p className="text-white/70 font-serif text-sm sm:text-base">
            Match pairs of romantic hearts and emojis{game?.hasReward ? ' to win a prize!' : '!'}
          </p>
        </motion.div>

        {/* Game stats header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 border border-white/20 shadow-lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-center">
            <motion.div
              key={score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white/70 font-serif text-sm">Score</p>
              <motion.p 
                key={score}
                initial={{ scale: 1.3, color: '#fbbf24' }}
                animate={{ scale: 1, color: getScoreColor().includes('green') ? '#10b981' : getScoreColor().includes('yellow') ? '#fbbf24' : '#6b7280' }}
                transition={{ duration: 0.4 }}
                className={`text-2xl font-serif font-bold ${getScoreColor()}`}
              >
                {score}
              </motion.p>
            </motion.div>
            <motion.div
              animate={timeRemaining < 30 ? { 
                scale: [1, 1.1, 1],
                transition: { repeat: Infinity, duration: 1 }
              } : {}}
            >
              <p className="text-white/70 font-serif text-sm">Time</p>
              <p className={`text-2xl font-serif font-bold ${timeRemaining < 30 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeRemaining)}
              </p>
            </motion.div>
            <div>
              <p className="text-white/70 font-serif text-sm">Moves</p>
              <motion.p 
                key={moves}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-serif font-bold text-white"
              >
                {moves}
              </motion.p>
            </div>
            <motion.div
              key={`${matchedPairs.length}-${DIFFICULTY_LEVELS[difficulty].pairs}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white/70 font-serif text-sm">Matched</p>
              <p className="text-2xl font-serif font-bold text-white">
                {matchedPairs.length}/{DIFFICULTY_LEVELS[difficulty].pairs}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Game board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-2 sm:p-3 md:p-4 border border-white/20 shadow-xl"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${DIFFICULTY_LEVELS[difficulty].size}, 1fr)`,
            gap: '6px',
            maxWidth: difficulty === 'easy' ? '400px' : difficulty === 'medium' ? '600px' : '700px',
            margin: '0 auto',
          }}
        >
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.02,
                type: "spring",
                stiffness: 150,
                damping: 18,
                mass: 0.9
              }}
              whileTap={!card.isFlipped && !card.isMatched && !isProcessing ? { 
                scale: 0.95,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }
              } : {}}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || isProcessing || gameOver}
              className={`
                aspect-square rounded-lg sm:rounded-xl font-serif text-xl sm:text-2xl md:text-3xl
                transition-all duration-300 relative overflow-hidden
                ${card.isMatched
                  ? 'bg-gradient-to-br from-green-400/40 to-emerald-500/40 border-2 border-green-400 cursor-default shadow-lg shadow-green-500/50'
                  : card.isFlipped
                  ? 'bg-gradient-to-br from-white/40 to-white/30 border-2 border-white/60 cursor-default shadow-md'
                  : 'bg-gradient-to-br from-white/15 to-white/5 border-2 border-white/20 cursor-pointer shadow-sm'
                }
                ${isProcessing || gameOver ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              
              {/* Match celebration particles */}
              {card.isMatched && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [1, 1, 0],
                        x: Math.cos((i * 60) * Math.PI / 180) * 30,
                        y: Math.sin((i * 60) * Math.PI / 180) * 30,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      <span className="text-2xl">✨</span>
                    </motion.div>
                  ))}
                </>
              )}

              <AnimatePresence>
                {card.isFlipped || card.isMatched ? (
                  <motion.div
                    key="flipped"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      opacity: { duration: 0.2 },
                    }}
                    className="relative z-10"
                  >
                    {card.isMatched ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                        }}
                        transition={{
                          duration: 0.5,
                          ease: "easeInOut",
                        }}
                      >
                        {card.icon}
                      </motion.div>
                    ) : (
                      card.icon
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/30 relative z-10"
                  >
                    ❓
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>

        {/* Game over - Show GameCompletionScreen if prize won and has rewards, otherwise show simple completion */}
        <AnimatePresence>
          {gameOver && prizeWon && showCompletionScreen && !showRewardFlow ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <GameCompletionScreen
                score={score}
                hasRewards={game?.hasReward && game?.rewards && Array.isArray(game.rewards) && game.rewards.length > 0}
                onClaimReward={(game?.hasReward && game?.rewards && Array.isArray(game.rewards) && game.rewards.length > 0) ? () => {
                  setShowCompletionScreen(false);
                  setShowRewardFlow(true);
                } : undefined}
                onMaybeLater={() => {
                  setGameOver(false);
                  setShowCompletionScreen(false);
                  if (onPrizeWon) {
                    onPrizeWon(score);
                  }
                  if (onBack) onBack();
                }}
              />
            </motion.div>
          ) : gameOver && !prizeWon ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl p-8 md:p-12 max-w-md w-full border border-white/20 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  {timeRemaining === 0 ? '⏰' : '💪'}
                </motion.div>
                <h2 className="text-3xl font-serif text-white mb-4">
                  {timeRemaining === 0 ? 'Time\'s Up!' : 'Game Complete!'}
                </h2>
                <p className="text-white/80 font-serif mb-2">
                  Final Score: <span className="text-yellow-300 font-bold">{score} points</span>
                </p>
                {game?.hasReward && (
                <p className="text-white/70 font-serif text-sm mb-6">
                  {score >= PRIZE_THRESHOLD * 0.7
                    ? `You're close! Try again to reach ${PRIZE_THRESHOLD} points!`
                    : `Score ${PRIZE_THRESHOLD} points to win a prize!`}
                </p>
                )}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setDifficulty(null);
                      setGameOver(false);
                    }}
                    className="flex-1 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-serif font-semibold transition-all"
                  >
                    Play Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-serif font-semibold transition-all"
                  >
                    Back
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

      </div>

      {/* Reward Flow */}
      {showRewardFlow && game?.rewards && (
        <RewardFlow
          rewards={game.rewards}
          userId={userId}
          letterId={letterId}
          gameId={game.id}
          gameType={game.type}
          passed={prizeWon}
          startStep="selection"
          onComplete={() => {
            setShowRewardFlow(false);
            setShowCompletionScreen(false);
            setGameOver(false);
            if (onPrizeWon) {
              onPrizeWon(score);
            }
            // Trigger games refresh in parent component
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('gameCompleted', { detail: { gameId: game.id, gameType: game.type } }));
            }
            if (onBack) onBack();
          }}
          onBack={() => {
            setShowRewardFlow(false);
            setShowCompletionScreen(true);
          }}
        />
      )}
    </div>
  );
}

