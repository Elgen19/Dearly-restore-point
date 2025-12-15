// RewardFlow.jsx - Orchestrates the complete reward flow
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import GameCompletionScreen from './GameCompletionScreen';
import MysteryRewardSelection from './MysteryRewardSelection';
import RewardRevealScreen from './RewardRevealScreen';
import RewardNotificationScreen from './RewardNotificationScreen';

export default function RewardFlow({ rewards, userId, letterId, gameId, gameType, onComplete, onBack, startStep = 'selection', passed = true }) {
  const [step, setStep] = useState(startStep); // completion -> selection -> reveal -> notification
  const [selectedReward, setSelectedReward] = useState(null);
  
  // Log props on mount to debug
  useEffect(() => {
    console.log('🎁 RewardFlow initialized:', { userId, gameId, gameType, passed, rewardsCount: rewards?.length });
    
    // Verify game exists before allowing reward selection
    if (gameId && userId) {
      const verifyGame = async () => {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          const response = await fetch(`${backendUrl}/api/games/${userId}`);
          if (response.ok) {
            const data = await response.json();
            const game = data.games?.find(g => g.id === gameId);
            if (!game) {
              console.error('❌ Game not found in user games list:', { gameId, availableGames: data.games?.map(g => g.id) });
            } else {
              console.log('✅ Game verified:', { gameId, gameType: game.type, hasReward: game.hasReward });
            }
          }
        } catch (error) {
          console.error('❌ Error verifying game:', error);
        }
      };
      verifyGame();
    }
  }, [userId, gameId]);

  // If no rewards, show fallback
  if (!rewards || rewards.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" />
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <div className="text-6xl mb-6">🎁</div>
          <h1 className="text-3xl font-serif text-gray-800 mb-4">
            No rewards available
          </h1>
          <p className="text-gray-600 font-serif mb-8">
            This game doesn't have any rewards set up.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold text-lg shadow-lg"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleStartRewardSelection = () => {
    setStep('selection');
  };

  const handleMaybeLater = () => {
    // This is no longer used, but kept for compatibility
    if (onComplete) {
      onComplete();
    }
  };

  const handleSelectBox = async (reward) => {
    console.log('🎁 Reward selected:', reward);
    setSelectedReward(reward);
    setStep('reveal');
    
    // Get the reward ID (handle id, _id, or use index as fallback)
    let rewardId = reward?.id || reward?._id;
    
    // If no ID exists, use the index from the rewards array
    // First try to use the index property if it exists
    if (!rewardId && reward?.index !== undefined && reward?.index !== null) {
      rewardId = reward.index.toString();
      console.log('📝 Using reward.index as ID:', rewardId);
    }
    
    // If still no ID, find the index in the rewards array
    if (!rewardId && rewards && Array.isArray(rewards)) {
      const index = rewards.findIndex(r => {
        // Exact match
        if (r === reward) return true;
        // Match by key properties
        return (r?.name === reward?.name && 
                r?.type === reward?.type && 
                (r?.index === reward?.index || 
                 r?.description === reward?.description ||
                 r?.instructions === reward?.instructions));
      });
      if (index !== -1) {
        rewardId = index.toString();
        console.log('📝 Using array index as reward ID:', rewardId);
      }
    }
    
    // Validate all required data
    if (!gameId) {
      console.error('❌ Cannot save reward: gameId is missing', { gameId, userId, passed, rewardId });
      return;
    }
    
    if (!userId) {
      console.error('❌ Cannot save reward: userId is missing', { gameId, userId, passed, rewardId });
      return;
    }
    
    if (!rewardId && rewardId !== '0') {
      console.error('❌ Cannot save reward: rewardId is missing', { gameId, userId, passed, reward: reward });
      return;
    }
    
    if (!passed) {
      console.warn('⚠️ Cannot save reward: user did not pass', { gameId, userId, passed, rewardId });
      return;
    }
    
    // Save the reward when selected - always use POST since it handles rewardId
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const url = `${backendUrl}/api/games/${userId}/${gameId}/complete`;
      console.log('💾 Saving reward claim:', { 
        url, 
        userId, 
        gameId, 
        rewardId, 
        passed,
        reward: {
          id: reward?.id,
          _id: reward?._id,
          name: reward?.name,
          title: reward?.title,
          typeName: reward?.typeName
        }
      });
      
      // Always use POST to save reward (POST endpoint handles rewardId, PUT only handles message)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passed: true,
          rewardId: rewardId,
          message: `Reward selected: ${reward?.name || reward?.typeName || reward?.title || 'reward'}`,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Game marked as completed with reward:', result);
        
        // Verify the reward was saved by checking the response
        if (result && result.game && result.game.claimedRewardId) {
          console.log('✅ Reward ID confirmed saved in database:', result.game.claimedRewardId);
        } else if (result && result.claimedRewardId) {
          console.log('✅ Reward ID confirmed saved:', result.claimedRewardId);
        } else {
          console.warn('⚠️ Reward saved but claimedRewardId not in response:', result);
        }
        
        // Trigger games refresh immediately
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('gameCompleted', { detail: { gameId, gameType } }));
          // Also trigger a refresh games event
          window.dispatchEvent(new CustomEvent('refreshGames'));
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save reward:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url,
          userId,
          gameId,
          rewardId
        });
        
        // If 404, the game might not exist - try to create it first
        if (response.status === 404) {
          console.warn('⚠️ Game not found (404). Game might not exist in database yet.');
          console.warn('⚠️ This could mean the game was not properly created or the gameId is incorrect.');
        }
        
        // Try again after a short delay (might be a race condition)
        setTimeout(async () => {
          try {
            console.log('🔄 Retrying reward save...');
            const retryResponse = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                passed: true,
                rewardId: rewardId,
                message: null,
              }),
            });
            
            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();
              console.log('✅ Reward saved on retry:', retryResult);
              if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('refreshGames'));
              }
            } else {
              const retryErrorText = await retryResponse.text();
              console.error('❌ Retry also failed:', retryResponse.status, retryErrorText);
            }
          } catch (retryError) {
            console.error('❌ Retry error:', retryError);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error saving reward:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId,
        gameId,
        rewardId
      });
      // Still continue the flow even if save fails
    }
  };

  const handleClaimReward = async () => {
    // Notify the sender that the reward has been claimed
    console.log('🎁 Claiming reward:', selectedReward);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Send notification that reward has been claimed (non-blocking)
      // Note: Messages endpoint may not exist yet, so we'll log but not block the flow
      try {
        const messageResponse = await fetch(`${backendUrl}/api/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            letterId,
            message: `I've completed the game and claimed my reward: ${selectedReward?.name || selectedReward?.typeName || selectedReward?.title || 'the reward'}! I'm so excited! 💝`,
            type: 'reward-claim',
            rewardId: selectedReward?.id || selectedReward?._id || null,
            gameId: gameId || null,
          }),
        });
        
        if (!messageResponse.ok) {
          // 404 is expected if messages endpoint doesn't exist yet
          if (messageResponse.status !== 404) {
            console.warn('⚠️ Failed to send notification (non-critical):', messageResponse.status);
          }
        } else {
          console.log('✅ Notification sent successfully');
        }
      } catch (error) {
        // Silently fail - messages endpoint may not be implemented yet
        console.log('ℹ️ Messages endpoint not available (non-critical)');
      }

      // Ensure reward is saved in game completion (backup - should already be saved in handleSelectBox)
      let rewardId = selectedReward?.id || selectedReward?._id;
      // Use index property if available
      if (!rewardId && selectedReward?.index !== undefined && selectedReward?.index !== null) {
        rewardId = selectedReward.index.toString();
      }
      // Use array index as fallback if no ID
      if (!rewardId && rewards && Array.isArray(rewards)) {
        const index = rewards.findIndex(r => {
          if (r === selectedReward) return true;
          return (r?.name === selectedReward?.name && 
                  r?.type === selectedReward?.type && 
                  (r?.index === selectedReward?.index || 
                   r?.description === selectedReward?.description ||
                   r?.instructions === selectedReward?.instructions));
        });
        if (index !== -1) {
          rewardId = index.toString();
        }
      }
      if (gameId && passed && rewardId) {
        try {
          // Use POST to ensure rewardId is saved (PUT only handles message)
          const updateResponse = await fetch(`${backendUrl}/api/games/${userId}/${gameId}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              passed: true,
              rewardId: rewardId,
              message: `Reward selected: ${selectedReward?.name || selectedReward?.typeName || selectedReward?.title || 'reward'}`,
            }),
          });
          
          if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log('✅ Game completion updated with reward claim:', result);
            // Trigger games refresh
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('refreshGames'));
            }
          } else {
            const errorText = await updateResponse.text();
            console.warn('⚠️ Failed to update game completion:', updateResponse.status, errorText);
          }
        } catch (error) {
          console.error('❌ Error updating game completion:', error);
        }
      }

      // Show notification screen
      setStep('notification');
    } catch (error) {
      console.error('❌ Error claiming reward:', error);
      // Still show notification screen
      setStep('notification');
    }
  };

  const handleNotificationClose = () => {
    // Refresh games list to reflect completion status
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('refreshGames'));
    }
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'completion' && (
        <GameCompletionScreen
          key="completion"
          onClaimReward={handleStartRewardSelection}
          onMaybeLater={handleMaybeLater}
        />
      )}
      {step === 'selection' && (
        <MysteryRewardSelection
          key="selection"
          rewards={rewards}
          onSelectBox={handleSelectBox}
          onBack={() => setStep('completion')}
        />
      )}
      {step === 'reveal' && (
        <RewardRevealScreen
          key="reveal"
          reward={selectedReward}
          onMessageMe={handleClaimReward}
          onMaybeLater={null}
        />
      )}
      {step === 'notification' && (
        <RewardNotificationScreen
          key="notification"
          reward={selectedReward}
          onClose={handleNotificationClose}
        />
      )}
    </AnimatePresence>
  );
}

