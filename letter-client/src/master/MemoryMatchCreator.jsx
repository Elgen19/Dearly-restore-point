// MemoryMatchCreator.jsx - Create memory match game
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import MessageModal from '../components/MessageModal';

export default function MemoryMatchCreator({ onBack, onSaved }) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [pairs, setPairs] = useState([
    { id: 1, item1: '', item2: '' },
    { id: 2, item1: '', item2: '' },
    { id: 3, item1: '', item2: '' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', message: '', type: 'info' });

  const addPair = () => {
    setPairs([...pairs, { id: pairs.length + 1, item1: '', item2: '' }]);
  };

  const removePair = (id) => {
    if (pairs.length > 3) {
      setPairs(pairs.filter((p) => p.id !== id));
    }
  };

  const handlePairChange = (id, field, value) => {
    setPairs(pairs.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showMessage('Error', 'Please enter a game title', 'error');
      return;
    }

    if (pairs.some((p) => !p.item1.trim() || !p.item2.trim())) {
      showMessage('Error', 'Please fill in all pairs', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const gameData = {
        title: title.trim(),
        pairs: pairs.map((p) => ({ item1: p.item1.trim(), item2: p.item2.trim() })),
        settings: {
          difficulty: 'medium',
        },
      };

      // Call onSaved callback with game data
      if (onSaved) {
        onSaved(gameData);
      }
    } catch (error) {
      console.error('Error saving memory match:', error);
      showMessage('Error', 'Failed to save game. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showMessage = (title, message, type = 'info') => {
    setModalData({ title, message, type });
    setShowModal(true);
  };

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
              Create Memory Match 🧠
            </motion.h1>

            <div className="w-12" /> {/* Spacer for centering */}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="mb-6">
            <label className="block text-sm font-serif font-semibold text-gray-700 mb-2">
              Game Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Our Memories Match"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none font-serif text-lg"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-serif font-semibold text-gray-700">
                Matching Pairs *
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addPair}
                className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full font-serif text-sm font-semibold transition-all"
              >
                + Add Pair
              </motion.button>
            </div>

            <div className="space-y-4">
              {pairs.map((pair) => (
                <div
                  key={pair.id}
                  className="flex gap-4 items-center p-4 border-2 border-gray-200 rounded-xl"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={pair.item1}
                      onChange={(e) => handlePairChange(pair.id, 'item1', e.target.value)}
                      placeholder="Item 1"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none font-serif"
                    />
                  </div>
                  <div className="text-2xl text-pink-500">💕</div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={pair.item2}
                      onChange={(e) => handlePairChange(pair.id, 'item2', e.target.value)}
                      placeholder="Item 2"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none font-serif"
                    />
                  </div>
                  {pairs.length > 3 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removePair(pair.id)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center"
                    >
                      ×
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 font-serif">
              Minimum 3 pairs required. Players will match these pairs.
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-serif font-semibold text-lg transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Continue'}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
      />
    </div>
  );
}

