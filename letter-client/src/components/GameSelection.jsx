// GameSelection.jsx - Screen to choose from available games
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameSelection({ games = [], onSelectGame, onBack, userId }) {
  const [allGames, setAllGames] = useState([]);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  
  // Load viewed rewards from database
  const loadViewedRewards = useCallback(async () => {
    if (!userId) {
      console.log('🔔 No userId, returning empty set');
      return new Set();
    }
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      console.log(`🔔 Loading viewed rewards for userId: ${userId}`);
      const response = await fetch(`${backendUrl}/api/games/${userId}/viewed-rewards`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Loaded viewed rewards response:', data);
        if (data.success && Array.isArray(data.viewedRewardIds)) {
          const viewedSet = new Set(data.viewedRewardIds);
          console.log(`🔔 Loaded ${viewedSet.size} viewed reward IDs:`, Array.from(viewedSet));
          return viewedSet;
        }
      } else {
        console.error('🔔 Failed to load viewed rewards, response status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading viewed rewards:', error);
    }
    console.log('🔔 Returning empty set for viewed rewards');
    return new Set();
  }, [userId]);

  // Save viewed rewards to database
  const saveViewedRewards = useCallback(async (rewardIds) => {
    if (!userId) {
      console.log('🔔 No userId, cannot save viewed rewards');
      return;
    }
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const rewardIdsArray = Array.from(rewardIds);
      console.log(`🔔 Saving ${rewardIdsArray.length} viewed reward IDs for userId: ${userId}`, rewardIdsArray);
      
      const response = await fetch(`${backendUrl}/api/games/${userId}/viewed-rewards`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          viewedRewardIds: rewardIdsArray,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔔 Failed to save viewed rewards, response:', response.status, errorText);
        throw new Error(`Failed to save viewed rewards: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Viewed rewards saved to database successfully:', data);
    } catch (error) {
      console.error('❌ Error saving viewed rewards:', error);
    }
  }, [userId]);

  // Fetch all games to get rewards data
  const fetchAllGames = useCallback(async () => {
    if (!userId) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/games/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('GameSelection: Fetched all games:', data.games?.length);
        setAllGames(data.games || []);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  // Refresh games when rewards modal is opened
  useEffect(() => {
    if (showRewardsModal && userId) {
      console.log('GameSelection: Refreshing games when rewards modal opened');
      fetchAllGames();
    }
  }, [showRewardsModal, fetchAllGames, userId]);

  // Get all rewards from completed games that have rewards set up
  const obtainedRewards = useMemo(() => {
    const rewards = [];
    if (!Array.isArray(allGames) || allGames.length === 0) {
      console.log('GameSelection: No games available for rewards');
      return rewards;
    }
    
    console.log('GameSelection: Processing games for rewards:', allGames.map(g => ({
      id: g?.id,
      hasReward: g?.hasReward,
      isCompleted: g?.isCompleted,
      claimedRewardId: g?.claimedRewardId,
      rewardsCount: g?.rewards?.length,
      rewards: g?.rewards?.map(r => ({ id: r?.id, title: r?.title || r?.name }))
    })));
    
    allGames.forEach(game => {
      if (!game) return;
      
      // Check if game is completed and has rewards
      const hasReward = game.hasReward === true;
      const isCompleted = game.isCompleted === true;
      const hasClaimedRewardId = game.claimedRewardId != null && game.claimedRewardId !== '';
      const hasRewardsArray = Array.isArray(game.rewards) && game.rewards.length > 0;
      
      // Filter out any undefined/null rewards
      const validRewards = hasRewardsArray ? game.rewards.filter(r => r != null) : [];
      
      console.log('GameSelection: Checking game:', {
        gameId: game.id,
        hasReward,
        isCompleted,
        hasClaimedRewardId,
        hasRewardsArray,
        claimedRewardId: game.claimedRewardId
      });
      
      // Only include rewards from games that have rewards set up (hasReward: true)
      if (hasReward && isCompleted && hasClaimedRewardId && validRewards.length > 0) {
        // Use valid rewards (filtered to remove null/undefined)
        const rewardsToSearch = validRewards;
        
        // Try multiple ways to find the reward:
        // 1. Match by id or _id
        // 2. Match by index (if claimedRewardId is a number/index)
        // 3. Match by reward.index property
        let reward = rewardsToSearch.find(r => {
          if (!r) return false;
          // First try matching by ID
          if (r.id === game.claimedRewardId || r._id === game.claimedRewardId) {
            return true;
          }
          // Try matching by index property
          if (r.index !== undefined && r.index !== null) {
            const rewardIndex = String(r.index);
            const claimedIndex = String(game.claimedRewardId);
            if (rewardIndex === claimedIndex) {
              return true;
            }
          }
          return false;
        });
        
        // If not found by ID/index property, try array index
        if (!reward) {
          // Try to parse claimedRewardId as a number for array index
          const claimedIndex = parseInt(game.claimedRewardId, 10);
          const claimedIndexStr = String(game.claimedRewardId);
          
          // Check if it's a valid array index (use original rewards array for index access)
          if (!isNaN(claimedIndex) && claimedIndex >= 0 && claimedIndex < game.rewards.length) {
            const rewardByIndex = game.rewards[claimedIndex];
            if (rewardByIndex != null) {
              reward = rewardByIndex;
              console.log('📝 GameSelection: Found reward by array index:', claimedIndex);
            }
          }
          
          // Also try direct string matching in case rewards array has string keys
          if (!reward && game.rewards[claimedIndexStr]) {
            reward = game.rewards[claimedIndexStr];
            console.log('📝 GameSelection: Found reward by string index:', claimedIndexStr);
          }
        }
        
        if (reward) {
          console.log('✅ GameSelection: Found reward:', {
            rewardId: reward.id || reward._id || game.claimedRewardId,
            rewardIndex: reward.index,
            rewardTitle: reward.title || reward.name || reward.typeName,
            gameTitle: game.title,
            claimedRewardId: game.claimedRewardId,
            rewardFulfilled: game.rewardFulfilled
          });
          rewards.push({
            ...reward,
            id: reward.id || reward._id || game.claimedRewardId, // Use claimedRewardId as fallback
            title: reward.title || reward.name || reward.typeName,
            gameTitle: game.title || 'Game',
            gameType: game.type,
            gameId: game.id, // Add gameId for unique identification
            completedAt: game.completedAt,
            fulfilled: game.rewardFulfilled || false,
          });
        } else {
          // Enhanced error logging with fallback attempt
          const availableRewardsInfo = game.rewards.map((r, idx) => ({
            index: idx,
            id: r?.id || r?._id,
            indexProp: r?.index,
            name: r?.name || r?.title,
            hasData: !!r
          }));
          console.warn('⚠️ GameSelection: Reward not found for claimedRewardId:', game.claimedRewardId, 
            'Rewards array length:', game.rewards.length,
            'Available rewards info:', availableRewardsInfo);
          
          // Fallback: try to use array index anyway
          const fallbackIndex = parseInt(game.claimedRewardId, 10);
          if (!isNaN(fallbackIndex) && fallbackIndex >= 0 && fallbackIndex < game.rewards.length) {
            const fallbackReward = game.rewards[fallbackIndex];
            if (fallbackReward) {
              console.log('⚠️ Using fallback: Adding reward by array index despite failed lookup');
              rewards.push({
                ...fallbackReward,
                id: game.claimedRewardId,
                title: fallbackReward.title || fallbackReward.name || fallbackReward.typeName,
                gameTitle: game.title || 'Game',
                gameType: game.type,
                gameId: game.id, // Add gameId for unique identification
                completedAt: game.completedAt,
                fulfilled: game.rewardFulfilled || false,
              });
            }
          }
        }
      } else {
        if (hasReward && isCompleted && !hasClaimedRewardId) {
          console.log('ℹ️ GameSelection: Game completed but no claimedRewardId yet');
        }
      }
    });
    
    console.log('GameSelection: Total rewards found:', rewards.length, rewards);
    return rewards;
  }, [allGames]);

  // Track viewed reward IDs
  const [viewedRewardIds, setViewedRewardIds] = useState(new Set());
  const [loadingViewedRewards, setLoadingViewedRewards] = useState(true);

  // Load viewed rewards on mount
  useEffect(() => {
    const fetchViewedRewards = async () => {
      if (userId) {
        setLoadingViewedRewards(true);
        const viewed = await loadViewedRewards();
        setViewedRewardIds(viewed);
        setLoadingViewedRewards(false);
      }
    };
    fetchViewedRewards();
  }, [userId, loadViewedRewards]);

  // Check if there are unviewed rewards
  const hasUnviewedRewards = useMemo(() => {
    if (obtainedRewards.length === 0) {
      console.log('🔔 No rewards obtained, hasUnviewedRewards = false');
      return false;
    }
    
    if (loadingViewedRewards) {
      console.log('🔔 Still loading viewed rewards, hasUnviewedRewards = false');
      return false; // Don't show indicator while loading
    }
    
    // Get current reward IDs
    const currentRewardIds = new Set(
      obtainedRewards.map(reward => {
        // Create a unique ID for each reward (gameId + claimedRewardId)
        const gameId = reward.gameId || '';
        const rewardId = reward.id || reward._id || '';
        const uniqueId = `${gameId}_${rewardId}`;
        return uniqueId;
      })
    );

    console.log('🔔 Current reward IDs:', Array.from(currentRewardIds));
    console.log('🔔 Viewed reward IDs:', Array.from(viewedRewardIds));

    // Check if any current rewards are not in viewed list
    for (const rewardId of currentRewardIds) {
      if (!viewedRewardIds.has(rewardId)) {
        console.log('🔔 Found unviewed reward:', rewardId);
        return true;
      }
    }
    console.log('🔔 All rewards have been viewed, hasUnviewedRewards = false');
    return false;
  }, [obtainedRewards, viewedRewardIds, loadingViewedRewards]);

  // Listen for game completion events to refresh games list
  useEffect(() => {
    const handleGameCompleted = () => {
      console.log('GameSelection: Refreshing games list after completion...');
      if (userId) {
        setTimeout(() => {
          fetchAllGames();
        }, 500);
      }
    };

    const handleRefreshGames = () => {
      console.log('GameSelection: Refreshing games list...');
      if (userId) {
        setTimeout(() => {
          fetchAllGames();
        }, 500);
      }
    };

    window.addEventListener('gameCompleted', handleGameCompleted);
    window.addEventListener('refreshGames', handleRefreshGames);
    return () => {
      window.removeEventListener('gameCompleted', handleGameCompleted);
      window.removeEventListener('refreshGames', handleRefreshGames);
    };
  }, [userId, fetchAllGames]);
  const stars = useMemo(() => {
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
  }, []);

  const hearts = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: `heart-${i}`,
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 80,
      fontSize: 12 + Math.random() * 20,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
      {/* Background wrapper that extends with content */}
      <div className="fixed inset-0 bg-[#1a1a2e] z-0" />
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

      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="fixed bg-white rounded-full z-0"
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

      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="fixed text-pink-300/40 z-0"
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

      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none z-0" />
      
      {/* Content wrapper with scrolling */}
      <div className="relative z-10 h-full w-full flex items-start justify-center overflow-y-auto">

      {/* Header: Back button (left), Title/Icon/Subheader (center), Rewards icon (right) */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-start justify-between p-4 md:p-6">
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
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
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

        {/* Center: Icon, Title, and Subheader */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-4xl md:text-5xl mb-2"
          >
            🎮
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mb-2"
          >
            Choose Your Game
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 font-serif text-sm md:text-base"
          >
            {games.length > 0 
              ? `Select a game to play!${games.filter(g => g.hasReward).length > 0 ? ' Some games have rewards! 🎁' : ''}`
              : 'No games available yet'}
          </motion.p>
        </div>

        {/* Rewards Icon - Top Right */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={async (e) => {
            e.stopPropagation();
            // Mark all current rewards as viewed when modal is opened
            const currentRewardIds = new Set(
              obtainedRewards.map(reward => {
                const gameId = reward.gameId || '';
                const rewardId = reward.id || reward._id || '';
                const uniqueId = `${gameId}_${rewardId}`;
                console.log('🔔 Marking reward as viewed:', { gameId, rewardId, uniqueId });
                return uniqueId;
              })
            );
            console.log('🔔 Current reward IDs to mark as viewed:', Array.from(currentRewardIds));
            const updatedViewedIds = new Set([...viewedRewardIds, ...currentRewardIds]);
            console.log('🔔 Updated viewed IDs:', Array.from(updatedViewedIds));
            
            // Update state first for immediate UI update
            setViewedRewardIds(updatedViewedIds);
            
            // Save to database (await to ensure it completes)
            try {
              await saveViewedRewards(updatedViewedIds);
              console.log('✅ Viewed rewards saved successfully');
            } catch (error) {
              console.error('❌ Error saving viewed rewards:', error);
            }
            
            // Open modal after saving
            setShowRewardsModal(true);
          }}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group relative"
          aria-label="View rewards"
        >
          <span className="text-2xl">🎁</span>
          {/* Show notification indicator only if there are unviewed rewards */}
          {hasUnviewedRewards && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-[#2d1b4e] shadow-lg"
            />
          )}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-40 md:pt-44 pb-20 md:pb-24 w-full"
        style={{ position: 'relative', zIndex: 10 }}
      >

        {games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
          >
            <p className="text-white/70 font-serif text-lg">
              No games are available at the moment.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 lg:p-10 border border-white/20"
          >
            <div className="grid grid-cols-1 gap-6 md:gap-8 w-full">
              {games.map((game, index) => {
                const gameIcon = game.type === 'quiz' ? '❓' : game.type === 'word-scramble' ? '🔤' : '🧠';
                const gameTypeName = game.type === 'quiz' ? 'Love Quiz' : game.type === 'word-scramble' ? 'Word Scramble' : 'Memory Match';
                const isCompleted = game.isCompleted && game.hasReward;
                const isDisabled = isCompleted;
                
                return (
                  <motion.button
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={!isDisabled ? { scale: 1.01 } : {}}
                    whileTap={!isDisabled ? { scale: 0.99 } : {}}
                    onClick={() => !isDisabled && onSelectGame(game)}
                    disabled={isDisabled}
                    className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 lg:p-10 border border-white/10 transition-all text-left relative overflow-hidden group w-full ${
                      isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/10 cursor-pointer'
                    }`}
                  >
                  {/* Shimmer effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Reward Badge - Only show if game has reward */}
                  {game.hasReward && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                      className="absolute top-2 right-2 z-20 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1"
                    >
                      <span>🎁</span>
                      <span>Has Reward</span>
                    </motion.div>
                  )}
                  
                  {/* Completed Badge */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                      className="absolute top-2 right-2 z-20 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1"
                    >
                      <span>✅</span>
                      <span>Completed</span>
                    </motion.div>
                  )}

                  <div className="flex items-start gap-5 relative z-10">
                    <div className="text-6xl md:text-7xl flex-shrink-0">{gameIcon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white">
                          {game.title || gameTypeName}
                        </h3>
                      </div>
                      <p className="text-white/70 font-serif text-sm md:text-base mb-2 leading-relaxed">
                        {gameTypeName === 'Love Quiz' 
                          ? `Test your knowledge about your relationship with fun questions and see how well you know each other.${game.hasReward ? ' Complete the quiz to earn a reward! 🎁' : ''}`
                          : gameTypeName === 'Word Scramble'
                          ? `Unscramble romantic words one by one to reveal a hidden message!${game.hasReward ? ' Complete all words to earn a reward! 🎁' : ''}`
                          : `Match pairs of romantic hearts and emojis!${game.hasReward ? ' Score high to win a prize! 🎁' : ''}`}
                      </p>
                      {isCompleted && (
                        <p className="text-white/60 font-serif text-xs italic">
                          Already completed!
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
            </div>
          </motion.div>
        )}
      </motion.div>
      </div>
      {/* End of content wrapper with scrolling */}

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
                    {obtainedRewards.length > 0 
                      ? `You've earned ${obtainedRewards.length} ${obtainedRewards.length === 1 ? 'reward' : 'rewards'} from playing games`
                      : 'Rewards you\'ve earned from playing games'}
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
                          return '🎁';
                        })()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif text-white mb-1">
                          {reward.title || 'Reward'}
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

              {/* Empty State */}
              {obtainedRewards.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎁</div>
                  <p className="text-white/70 font-serif text-lg">
                    No rewards yet. Play games with rewards to earn prizes!
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

