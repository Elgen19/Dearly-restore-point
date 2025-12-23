// WordScrambleCreator.jsx - Create word scramble games
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function WordScrambleCreator({ onBack, onSaved, gameToEdit = null }) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState(gameToEdit?.title || 'Word Scramble');
  const [phrase, setPhrase] = useState('');
  const [words, setWords] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (gameToEdit?.words && Array.isArray(gameToEdit.words)) {
      // Filter out any null/undefined/empty values but keep all valid words including single letters
      const validWords = gameToEdit.words.filter(word => word && typeof word === 'string' && word.length > 0);
      setWords(validWords);
      // Reconstruct phrase from words
      setPhrase(validWords.join(' '));
      console.log('📝 Loaded game words:', { validWords, original: gameToEdit.words });
    }
  }, [gameToEdit]);

  // Function to extract words from phrase (include all words, including single-letter words like "I" or "a")
  const extractWords = (text) => {
    if (!text || typeof text !== 'string') return [];
    
    // Split by whitespace and process each word
    const rawWords = text.trim().split(/\s+/);
    
    const words = rawWords
      .map(word => {
        // Remove punctuation but preserve the word
        // Important: Single-letter words like "I" or "a" MUST be preserved
        const cleaned = word.replace(/[^\w]/g, '');
        return cleaned;
      })
      .filter(word => {
        // CRITICAL: Keep ALL words with length >= 1 (this includes single-letter words)
        // Only filter out truly empty strings
        return word && word.length >= 1; // Changed from > 0 to >= 1 to be explicit
      });
    
    // Debug logging to verify single-letter words are included
    console.log('🔤 Extracted words from phrase:', { 
      original: text,
      rawWords: rawWords,
      words: words,
      wordCount: words.length,
      singleLetterWords: words.filter(w => w.length === 1),
      allWordLengths: words.map(w => ({ word: w, length: w.length }))
    });
    
    return words;
  };

  const handlePhraseChange = (e) => {
    const newPhrase = e.target.value;
    setPhrase(newPhrase);
    const extractedWords = extractWords(newPhrase);
    setWords(extractedWords);
    
    // Additional validation: Ensure single-letter words are preserved
    if (extractedWords.length > 0) {
      console.log('✅ Words array updated:', extractedWords);
    }
  };

  const handleRemoveWord = (index) => {
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
    setPhrase(newWords.join(' '));
  };

  const handleSave = () => {
    if (words.length === 0) {
      alert('Please add at least one word');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (onSaved) {
      // Ensure all words are strings and preserve single-letter words
      // Don't filter by length - include ALL words including single letters
      const validWords = words
        .filter(word => word != null && word !== undefined && word !== '')
        .map(word => String(word).trim())
        .filter(word => word.length > 0); // This will keep "I", "a", etc. (length === 1 is > 0)
      
      console.log('💾 Saving word scramble game:', {
        title: title.trim(),
        originalWordsCount: words.length,
        validWordsCount: validWords.length,
        words: validWords,
        hasSingleLetters: validWords.filter(w => w.length === 1)
      });
      
      onSaved({
        title: title.trim(),
        words: validWords, // This array includes ALL words, even single-letter ones
        settings: {
          includeAllWords: true, // Include all words regardless of length
        },
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 w-full z-50 overflow-hidden shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative max-w-7xl mx-auto flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-lg text-center">
              {gameToEdit ? 'Edit Word Scramble 🔤' : 'Create Word Scramble 🔤'}
            </h1>

            <div className="w-12" />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6"
        >
          {/* Title Input */}
          <div>
            <label className="block text-sm font-serif font-semibold text-gray-700 mb-2">
              Game Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Word Scramble"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none font-serif"
            />
          </div>

          {/* Phrase Input */}
          <div>
            <label className="block text-sm font-serif font-semibold text-gray-700 mb-2">
              Enter Your Romantic Phrase
            </label>
            <textarea
              value={phrase}
              onChange={handlePhraseChange}
              placeholder="I love you Faith now and forever"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none font-serif resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 font-serif">
              All words will be included automatically, including single-letter and two-letter words.
            </p>
          </div>

          {/* Words Preview */}
          <div>
            <label className="block text-sm font-serif font-semibold text-gray-700 mb-2">
              Words to Scramble ({words.length})
            </label>
            {words.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 font-serif">
                No words yet. Type a phrase above!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 rounded-xl min-h-[100px]">
                {words.map((word, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-pink-100 to-rose-100 px-3 py-2 rounded-lg flex items-center gap-2"
                  >
                    <span className="font-serif font-semibold text-gray-800">{word}</span>
                    <button
                      onClick={() => handleRemoveWord(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={words.length === 0 || saving}
              className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-serif font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Game'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

