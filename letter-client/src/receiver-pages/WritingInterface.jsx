// WritingInterface.jsx - Romantic letter writing interface
import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollUnravelPreview from "../components/ScrollUnravelPreview";

export default function WritingInterface({ onComplete, onBack, letterId, userId, receiverName }) {
  const [letterContent, setLetterContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreviewButtons, setShowPreviewButtons] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Memoize stars to prevent regeneration on every render
  const stars = useMemo(() => {
    return [...Array(100)].map((_, i) => {
      const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      return {
        id: i,
        size,
        delay,
        duration,
        left: Math.random() * 100,
        top: Math.random() * 100,
      };
    });
  }, []);

  // Memoize hearts to prevent regeneration on every render
  const hearts = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 80,
      fontSize: 12 + Math.random() * 20,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);

  const writingPrompts = [
    {
      name: "Grateful Response",
      content: `Dear [Name],

I wanted to take a moment to tell you how much your letter meant to me. Reading your words felt like receiving a warm embrace, and I found myself smiling as I absorbed each sentence you wrote.

Your letter reminded me of the beautiful connection we share, and it touched my heart in ways I'm still processing. The thoughtfulness behind every word didn't go unnoticed, and I'm grateful that you took the time to share your feelings with me.

There's something special about receiving a letter like yours—it's more personal, more meaningful than a quick message. It shows that you care enough to sit down and truly express what's in your heart, and that means the world to me.

I hope this letter finds you well and brings a smile to your face, just as yours did for me.`

    },
    {
      name: "Heartfelt Reply",
      content: `My dearest,

Reading your words filled my heart with warmth and joy that I haven't felt in a while. Each paragraph you wrote seemed to understand parts of me that I thought were hidden, and it's both comforting and beautiful to feel so seen.

Your letter arrived at just the right moment, like a gentle reminder that even when we're apart, there's a thread of connection between us that distance can't break. The way you expressed your thoughts, your hopes, and your feelings—it all resonated deeply with me.

I want you to know that your words have been on my mind since I read them. They've brought me comfort, made me reflect, and reminded me of the importance of genuine connection in our lives.

Thank you for sharing your heart with me. It's a gift I'll treasure.`

    },
    {
      name: "Thoughtful Response",
      content: `To the one who wrote such beautiful words,

I find myself thinking about what you shared, and I wanted to respond with the same care and thoughtfulness you showed me. Your letter wasn't just words on a page—it was a piece of your heart, and I'm honored that you chose to share it with me.

What struck me most was the sincerity in your writing. There's something powerful about putting pen to paper (or fingers to keyboard) and truly expressing what's inside. Your letter felt authentic, vulnerable, and deeply meaningful.

I've been reflecting on your words, and they've inspired me to be more open, more present, and more appreciative of the connections we have in our lives. Your letter reminded me that sometimes the most beautiful moments come from simple, honest communication.

I hope this response brings you the same warmth and comfort your letter brought me.`

    },
  ];

  const handleUsePrompt = (prompt) => {
    setLetterContent(prompt);
  };

  const handlePreview = () => {
    if (letterContent.trim()) {
      setShowPreview(true);
      setShowPreviewButtons(false);
    }
  };

  const handlePreviewComplete = useCallback(() => {
    // Show buttons when scroll animation completes
    setShowPreviewButtons(true);
  }, []);

  const handlePreviewBack = useCallback(() => {
    setShowPreview(false);
    setShowPreviewButtons(false);
    setPreviewKey((prev) => prev + 1);
  }, []);

  const handleConfirm = async () => {
    if (!letterContent.trim() || !letterId || !userId) {
      console.error('❌ WritingInterface: Cannot save - missing data:', { 
        hasContent: !!letterContent.trim(), 
        letterId, 
        userId 
      });
      return;
    }
    
    console.log('💾 WritingInterface: Saving response with:', { userId, letterId, contentLength: letterContent.trim().length });
    setIsSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const url = `${backendUrl}/api/letters/${userId}/${letterId}/responses`;
      console.log('💾 WritingInterface: POST to:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: letterContent.trim(),
          receiverName: receiverName || "Friend",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save response');
      }

      const result = await response.json();
      console.log('💾 WritingInterface: Save response result:', result);
      if (result.success) {
        console.log('✅ WritingInterface: Response saved successfully');
        setShowPreview(false);
        setShowSuccess(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to save response');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Failed to save your response. Please try again.');
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setShowPreview(false);
    setPreviewKey(prev => prev + 1); // Force new instance when editing to remount component
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Romantic Background */}
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
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="fixed bg-white rounded-full pointer-events-none"
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
          key={`heart-${heart.id}`}
          className="fixed text-pink-300/40 pointer-events-none"
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

      {/* Back Button - Top Left (Desktop Only) */}
      {onBack && !showPreview && !showSuccess && (
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
          className="hidden md:flex absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/20 shadow-lg transition-all group"
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
      <div className="relative z-10 w-full h-screen flex items-center justify-center py-4">
        {/* Preview with ScrollUnravelPreview - Outside AnimatePresence to prevent double mount */}
        {showPreview && !showSuccess && (
          <motion.div
            key={`preview-${previewKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full absolute inset-0"
          >
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handlePreviewBack();
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
            <div className="w-full h-full relative pb-20 md:pb-0">
              <ScrollUnravelPreview
                letterContent={letterContent}
                userFirstName={receiverName ? receiverName.split(' ')[0] : ""}
                letterTitle="Your Response"
                autoLoop={false}
                showTitleOpener={false}
                onOpenComplete={handlePreviewComplete}
              />
              
              {/* Confirm/Edit Buttons Overlay */}
              {showPreviewButtons && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed md:absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-50 flex flex-row gap-2 md:gap-4 w-[calc(100vw-2rem)] md:w-auto max-w-[calc(100vw-2rem)] md:max-w-none px-2 md:px-0"
                >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  disabled={isSaving}
                  className="flex-1 md:flex-none md:w-auto min-w-0 px-3 md:px-6 py-2.5 md:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full font-serif text-xs md:text-lg shadow-lg transition-all border border-white/20 disabled:opacity-50 whitespace-nowrap"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  disabled={isSaving}
                  className="flex-1 md:flex-none md:w-auto min-w-0 px-3 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white rounded-full font-serif text-xs md:text-lg shadow-lg transition-all overflow-hidden group disabled:opacity-50 whitespace-nowrap"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-base">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span className="hidden sm:inline">Saving...</span>
                      <span className="sm:hidden">...</span>
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-base">
                      <span className="hidden sm:inline">✉️ Confirm & Send</span>
                      <span className="sm:hidden">✉️ Send</span>
                    </span>
                  )}
                </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Success Page */}
          {showSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl mx-auto px-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-6xl mb-6"
              >
                ✅
              </motion.div>
              <h2 className="text-3xl font-serif text-white mb-4">
                Your Response Has Been Saved!
              </h2>
              <p className="text-gray-300 font-serif text-lg mb-8">
                Your heartfelt words have been delivered. Thank you for sharing your thoughts.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-pink-200 font-serif text-base italic"
              >
                Redirecting you back...
              </motion.div>
            </motion.div>
          )}

          {/* Writing Interface */}
          {!showPreview && !showSuccess && (
            <motion.div
              key="writing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl mx-auto px-4 h-full flex items-center"
            >
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20 w-full max-h-[95vh] flex flex-col relative"
              >
                {/* Back Button - Mobile Only (Inside Card) */}
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
                    className="md:hidden absolute top-4 left-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
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
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-3 flex-shrink-0 pt-12 md:pt-0"
                >
                  <div className="text-3xl mb-1">✉️</div>
                  <h1 className="text-2xl md:text-3xl font-serif text-white mb-1">
                    Write Your Letter
                  </h1>
                  <p className="text-gray-300 text-sm font-serif italic">
                    Pour your heart onto the page...
                  </p>
                </motion.div>

                {/* Writing Prompts */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-3 flex-shrink-0"
                >
                  <p className="text-xs text-white/80 font-serif mb-2">Need inspiration? Try a prompt:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {writingPrompts.map((prompt, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUsePrompt(prompt.content)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-serif transition-all border border-white/20"
                      >
                        {prompt.name}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Text Area */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative mb-3 flex-grow min-h-[300px]"
                >
                  <textarea
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    placeholder="Begin writing your letter here... Let your heart guide your words."
                    className="w-full h-full min-h-[300px] p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl font-serif text-sm text-white leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent placeholder:text-white/50 placeholder:italic"
                  />
                </motion.div>

                {/* Preview Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center items-center flex-shrink-0"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePreview}
                    disabled={!letterContent.trim()}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-serif font-semibold text-base shadow-lg transition-all overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center gap-2 justify-center">
                      📄 Preview
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
