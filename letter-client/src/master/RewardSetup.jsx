// RewardSetup.jsx - Setup rewards for games
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import MessageModal from '../components/MessageModal.jsx';

export default function RewardSetup({ onBack, onComplete, initialRewards = [], mode = 'create', skipTypeSelection = false }) {
  const rewardTypes = useMemo(() => [
    {
      id: 'food-drink',
      name: 'Food / Drink',
      description: 'Coffee dates, dinner, favorite snacks, etc.',
      icon: '☕',
    },
    {
      id: 'date-outing',
      name: 'Date / Outing',
      description: 'Special dates, activities, adventures together',
      icon: '📅',
    },
    {
      id: 'emotional-digital',
      name: 'Emotional / Digital Gift',
      description: 'Letter, video, song, or heartfelt message',
      icon: '💌',
    },
  ], []);

  const hasInitialRewards = Array.isArray(initialRewards) && initialRewards.length === 3;
  const emptyTypeSlots = ['', '', ''];
  const defaultRewards = [
    { type: '', name: '', description: '', isPhysical: true, instructions: '' },
    { type: '', name: '', description: '', isPhysical: true, instructions: '' },
    { type: '', name: '', description: '', isPhysical: true, instructions: '' },
  ];

  const deriveTypeName = (typeId) => {
    const type = rewardTypes.find((t) => t.id === typeId);
    return type ? type.name : 'Reward';
  };

  const initialSelectedTypes = hasInitialRewards
    ? initialRewards.map((reward) => reward.type || '')
    : skipTypeSelection
    ? ['food-drink', 'date-outing', 'emotional-digital'] // Pre-select types when skipping
    : [...emptyTypeSlots];
  const [step, setStep] = useState(hasInitialRewards || skipTypeSelection ? 'details' : 'typeSelection'); // typeSelection -> details
  const [selectedTypes, setSelectedTypes] = useState(initialSelectedTypes);
  const [cameFromDetails, setCameFromDetails] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'warning' });

  // Memoize hearts to prevent regeneration on every render
  const hearts = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: `heart-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      fontSize: 20 + Math.random() * 40,
      xOffset: Math.random() * 50 - 25,
      duration: 8 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
  }, []);

  const [rewards, setRewards] = useState(() => {
    if (hasInitialRewards) {
      return initialRewards.map((reward, index) => ({
        type: reward.type || initialSelectedTypes[index] || '',
        typeName: reward.typeName || deriveTypeName(reward.type || initialSelectedTypes[index]),
        name: reward.name || '',
        description: reward.description || '',
        isPhysical: reward.isPhysical !== undefined ? reward.isPhysical : true,
        instructions: reward.instructions || '',
        index: index + 1,
      }));
    }
    if (skipTypeSelection) {
      // When skipping type selection, pre-select default types for all 3 rewards
      const defaultTypes = [
        { id: 'food-drink', name: 'Food / Drink' },
        { id: 'date-outing', name: 'Date / Outing' },
        { id: 'emotional-digital', name: 'Emotional / Digital Gift' },
      ];
      return defaultTypes.map((type, index) => ({
        type: type.id,
        typeName: type.name,
        name: '',
        description: '',
        isPhysical: type.id !== 'emotional-digital',
        instructions: '',
        index: index + 1,
      }));
    }
    return defaultRewards;
  });

  const handleTypeSelect = (index, typeId) => {
    setSelectedTypes((prev) => {
      const next = [...prev];
      next[index] = next[index] === typeId ? '' : typeId;
      return next;
    });
  };

  const handleTypeSelectionComplete = () => {
    const filled = selectedTypes.filter(Boolean);
    if (filled.length !== 3) {
      setModal({ isOpen: true, message: 'Please select a reward type for each choice', type: 'warning' });
      return;
    }

    const newRewards = selectedTypes.map((typeId, index) => {
      const type = rewardTypes.find((t) => t.id === typeId);
      return {
        type: typeId,
        typeName: type ? type.name : 'Reward',
        name: '',
        description: '',
        isPhysical: typeId !== 'emotional-digital',
        instructions: '',
        index: index + 1,
      };
    });
    setRewards(newRewards);
    setStep('details');
    setCameFromDetails(false);
  };

  const handleRewardChange = (index, field, value) => {
    setRewards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectionBack = () => {
    // If in edit mode and came from details, go back to details
    // Otherwise, go back to parent (Games list)
    if (cameFromDetails && (mode === 'edit' || hasInitialRewards)) {
      setStep('details');
      setCameFromDetails(false);
    } else {
      // In create mode or first time in typeSelection, go back to parent
      onBack();
    }
  };

  const handleReturnToTypes = () => {
    setCameFromDetails(true);
    setStep('typeSelection');
  };

  const handleComplete = () => {
    // Validate all rewards have names
    const allValid = rewards.every((r) => r.name.trim() !== '');
    if (!allValid) {
      setModal({ isOpen: true, message: 'Please provide a name for all 3 rewards', type: 'warning' });
      return;
    }

    onComplete(rewards);
  };

  if (step === 'typeSelection') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
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
                onClick={handleSelectionBack}
                className="w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg flex-shrink-0"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-2xl lg:text-3xl font-serif font-bold text-white drop-shadow-lg text-center flex-1 px-2"
              >
                Choose Reward Types 🎁
              </motion.h1>

              <div className="w-10 h-10 md:w-12 md:h-12" /> {/* Spacer for centering */}
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 lg:p-12"
          >
            <h2 className="text-lg md:text-2xl lg:text-3xl font-serif font-bold text-gray-800 mb-3 md:mb-4 text-center px-2">
              {hasInitialRewards || mode === 'edit'
                ? 'Update the type of rewards you want to offer'
                : 'Choose the type of rewards you want to offer'}
            </h2>
            <p className="text-sm md:text-base text-gray-600 font-serif text-center mb-6 md:mb-8 px-2">
              You'll add 3 mystery choices. You can mix types, but always require 3 total choices.
            </p>

            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
              {selectedTypes.map((selectedType, index) => (
                <div
                  key={`reward-type-${index}`}
                  className="border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 bg-white/70"
                >
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-serif">
                        Choice {index + 1}
                      </p>
                      <h3 className="text-base md:text-lg lg:text-xl font-serif font-bold text-gray-800">
                        {selectedType ? deriveTypeName(selectedType) : 'Select a type'}
                      </h3>
                    </div>
                    <span className="text-pink-500 text-2xl md:text-3xl">
                      {selectedType
                        ? rewardTypes.find((t) => t.id === selectedType)?.icon
                        : '🎁'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                    {rewardTypes.map((type) => {
                      const isSelected = selectedType === type.id;
                      return (
                        <button
                          key={`${type.id}-${index}`}
                          type="button"
                          onClick={() => handleTypeSelect(index, type.id)}
                          className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-pink-500 bg-pink-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-pink-200'
                          }`}
                        >
                          <div className="text-2xl md:text-3xl mb-2 md:mb-3">{type.icon}</div>
                          <p className="text-xs md:text-sm font-semibold font-serif text-gray-800">
                            {type.name}
                          </p>
                          <p className="text-xs font-serif text-gray-500 mt-1">
                            {type.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mb-4 md:mb-6">
              <p className="text-sm md:text-base text-gray-600 font-serif">
                {selectedTypes.filter(Boolean).length} / 3 choices selected
              </p>
            </div>

            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTypeSelectionComplete}
                disabled={selectedTypes.filter(Boolean).length !== 3}
                className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full font-serif font-semibold text-base md:text-lg transition-all ${
                  selectedTypes.filter(Boolean).length === 3
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Details step
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
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
              className="w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg flex-shrink-0"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl lg:text-3xl font-serif font-bold text-white drop-shadow-lg text-center flex-1 px-2"
            >
              {hasInitialRewards || mode === 'edit' ? 'Edit Reward Details 🎁' : 'Add Reward Details 🎁'}
            </motion.h1>

            <div className="w-10 h-10 md:w-12 md:h-12" /> {/* Spacer for centering */}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 md:space-y-6"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReturnToTypes}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-serif font-semibold text-pink-600 border border-pink-200 rounded-full hover:bg-pink-50 transition-colors"
            >
              Change reward types
            </button>
          </div>
          {rewards.map((reward, index) => {
            const type = rewardTypes.find((t) => t.id === reward.type);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8"
              >
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="text-2xl md:text-3xl">{type?.icon}</div>
                  <div>
                    <h3 className="text-lg md:text-xl font-serif font-bold text-gray-800">
                      Mystery Reward {index + 1}
                    </h3>
                    <p className="text-gray-600 font-serif text-xs md:text-sm">
                      {type?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-serif font-semibold text-gray-700 mb-2">
                      Name / Label (Internal) *
                    </label>
                    <input
                      type="text"
                      value={reward.name}
                      onChange={(e) => handleRewardChange(index, 'name', e.target.value)}
                      placeholder="e.g., Coffee Date, Romantic Dinner, Love Letter"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-pink-500 focus:outline-none font-serif"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-serif">
                      Internal name for your reference
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-serif font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={reward.description}
                      onChange={(e) => handleRewardChange(index, 'description', e.target.value)}
                      placeholder="What the receiver sees after choosing this reward"
                      rows={3}
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-pink-500 focus:outline-none font-serif resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-serif">
                      Optional description shown to receiver
                    </p>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // In edit mode, back button should go to Games list
              // In create mode, back button goes to type selection
              if (mode === 'edit' || hasInitialRewards) {
                onBack();
              } else {
                handleReturnToTypes();
              }
            }}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-serif font-semibold transition-all"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg"
          >
            Complete Setup
          </motion.button>
        </div>
      </div>

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

