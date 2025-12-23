// LoveQuizPlayer.jsx - Play a love quiz
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RewardFlow from './RewardFlow';
import GameCompletionScreen from './GameCompletionScreen';

export default function LoveQuizPlayer({ quiz, userId, letterId, onComplete, onBack, gameId }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [nextScreen, setNextScreen] = useState(null); // 'rewardFlow' | 'completionScreen' | null

  // Memoize background elements BEFORE any conditional returns (Rules of Hooks)
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

  const backgroundHearts = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `heart-${i}`,
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 80,
      fontSize: 12 + Math.random() * 20,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);

  // Shuffle answers for each question
  const shuffledAnswers = useMemo(() => {
    if (!quiz || !quiz.questions || currentQuestionIndex >= quiz.questions.length) return [];
    
    const question = quiz.questions[currentQuestionIndex];
    const allAnswers = [
      question.correctAnswer,
      ...question.wrongAnswers.filter(wa => wa.trim())
    ];
    
    // Shuffle array
    const shuffled = [...allAnswers].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [quiz, currentQuestionIndex]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = useCallback(async (finalAnswers) => {
    // Calculate score first
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      const userAnswer = finalAnswers[index] || '';
      if (userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    const passingScore = quiz.settings?.passingScore || 70;
    const hasPassed = finalScore >= passingScore;
    
    // Set score and determine next screen
    setScore(finalScore);
    
    // Always show congratulatory message first, then rewards if available
    // Set completion and next screen in a single state update to prevent white screen
    setQuizComplete(true);
    setNextScreen('completionScreen'); // Always show completion screen first

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    console.log('📊 Quiz results:', { finalScore, passingScore, hasPassed, correctCount, totalQuestions: quiz.questions.length });

    // Mark game as completed in the background (don't wait for it) - similar to word scramble
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    // Try to submit quiz result (only if quiz.id exists and is different from gameId)
    if (quiz.id && quiz.id !== gameId) {
      fetch(`${backendUrl}/api/quizzes/${userId}/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: finalAnswers,
          timeTaken,
          letterId: letterId || null,
        }),
      }).catch(err => console.warn('⚠️ Quiz submission error (non-critical):', err));
    }
    
    // Track game completion in the background (don't wait)
    if (gameId && userId) {
      fetch(`${backendUrl}/api/games/${userId}/${gameId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passed: hasPassed,
          score: finalScore,
        }),
      }).catch(err => console.error('Error completing game:', err));
    }
  }, [quiz, gameId, userId, letterId, startTime]);

  const handleNextQuestion = useCallback((answer = selectedAnswer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestionIndex + 1 >= quiz.questions.length) {
      // Quiz complete
      handleSubmit(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [selectedAnswer, answers, currentQuestionIndex, quiz, handleSubmit]);

  // Initialize timer
  useEffect(() => {
    if (quizComplete) return;
    
    const timeLimit = quiz?.settings?.timeLimitPerQuestion || 10;
    setTimeRemaining(timeLimit);
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - move to next question
          handleNextQuestion('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quizComplete, handleNextQuestion, quiz]);

  if (!quiz || !quiz.questions) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-y-auto">
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
        <p className="relative z-10 text-white text-xl font-serif">Loading quiz...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const passed = score >= (quiz.settings?.passingScore || 70);
  const hasRewards = quiz.hasReward && quiz.rewards && quiz.rewards.length > 0;

  // Show reward flow if quiz is complete, passed, and has rewards
  if (nextScreen === 'rewardFlow' && hasRewards) {
    return (
      <RewardFlow
        rewards={quiz.rewards}
        userId={userId}
        letterId={letterId}
        gameId={gameId}
        gameType="quiz"
        passed={passed}
        startStep="selection"
        onRewardSelected={async (rewardId) => {
          // This is handled by RewardFlow's handleSelectBox, so we don't need to do anything here
          // The reward is already saved when the box is selected
          console.log('🎁 Reward selected (already saved by RewardFlow):', rewardId);
        }}
        onComplete={() => {
          // Reward flow complete - go back to OptionsPage
          setNextScreen(null);
          if (onComplete) {
            onComplete({ score, passed });
          }
          if (onBack) onBack();
        }}
        onBack={() => {
          // Go back to completion screen if user clicks back
          setNextScreen('completionScreen');
        }}
      />
    );
  }

  // Show GameCompletionScreen if quiz is complete (handles both passed and failed cases)
  // Always show completion screen when quiz is complete (nextScreen will be set to 'completionScreen' or null)
  if (quizComplete && (nextScreen === 'completionScreen' || nextScreen === null)) {
    return (
      <GameCompletionScreen
        score={score}
        hasRewards={hasRewards && passed}
        onClaimReward={hasRewards && passed ? () => {
          setNextScreen('rewardFlow');
        } : undefined}
        onMaybeLater={() => {
          if (onComplete) {
            onComplete({ score, passed });
          }
          if (onBack) onBack();
        }}
      />
    );
  }

  // Fallback completion screen (shouldn't normally be reached, but kept as safety)
  if (quizComplete) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-y-auto overflow-x-hidden">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-2xl mx-auto px-4 py-8 md:py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-6"
          >
            {passed ? '🎉' : '💪'}
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            {passed ? 'You Did It!' : 'Keep Going!'}
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 mb-6"
          >
            <p className="text-white/80 font-serif text-lg mb-2">
              Your Score:
            </p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className={`text-6xl font-serif font-bold ${passed ? 'text-green-400' : 'text-yellow-400'}`}
            >
              {score}%
            </motion.p>
          </motion.div>

          {passed && !hasRewards ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 font-serif text-xl mb-6"
            >
              Your dedication shows, and that means the world. Thank you for taking the time to play 💝
            </motion.p>
          ) : !passed ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 font-serif text-xl mb-6"
            >
              Every step you take matters. I'm proud of you for trying, and I hope you'll give it another go when you're ready 🌸
            </motion.p>
          ) : null}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (onBack) onBack();
            }}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg"
          >
            Continue
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden">
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
        {backgroundHearts.map((heart) => (
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

      {/* Back button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Progress and Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 font-serif text-sm md:text-base">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <motion.div
              animate={timeRemaining < 10 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`text-base md:text-lg font-serif font-bold ${timeRemaining < 10 ? 'text-red-400' : 'text-white'}`}
            >
              ⏱️ {timeRemaining}s
            </motion.div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl mb-6"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-serif text-white mb-4 md:mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {shuffledAnswers.map((answer, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(answer)}
                  className={`
                    w-full text-left px-4 md:px-6 py-3 md:py-4 rounded-xl font-serif text-base md:text-lg
                    transition-all duration-300
                    ${selectedAnswer === answer
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg border-2 border-blue-300'
                      : 'bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20'
                    }
                  `}
                >
                  {answer}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: selectedAnswer ? 1 : 0.5 }}
          whileHover={selectedAnswer ? { scale: 1.05 } : {}}
          whileTap={selectedAnswer ? { scale: 0.95 } : {}}
          onClick={() => selectedAnswer && handleNextQuestion()}
          disabled={!selectedAnswer}
          className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-serif font-semibold text-lg md:text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex + 1 >= quiz.questions.length ? 'Submit Quiz' : 'Next Question →'}
        </motion.button>
      </div>
    </div>
  );
}

