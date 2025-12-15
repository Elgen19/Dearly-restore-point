// LoveQuizPlayer.jsx - Play a love quiz
import React, { useState, useEffect, useMemo } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showRewardFlow, setShowRewardFlow] = useState(false);

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
  }, [currentQuestionIndex, quizComplete]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = (answer = selectedAnswer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestionIndex + 1 >= quiz.questions.length) {
      // Quiz complete
      handleSubmit(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setIsSubmitting(true);
    setQuizComplete(true);

    // Calculate score
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
    
    setScore(finalScore);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    console.log('📊 Quiz results:', { finalScore, passingScore, hasPassed, correctCount, totalQuestions: quiz.questions.length });

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Try to submit quiz result (only if quiz.id exists and is different from gameId)
      // Note: Quiz games are stored as games, so quiz submission may not be necessary
      // But we try it for quizzes that exist in the quizzes collection
      if (quiz.id && quiz.id !== gameId) {
        try {
          const response = await fetch(`${backendUrl}/api/quizzes/${userId}/${quiz.id}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              answers: finalAnswers,
              timeTaken,
              letterId: letterId || null,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Quiz result submitted successfully');
          } else if (response.status !== 404) {
            // 404 is expected if quiz is stored as a game, so only warn for other errors
            console.warn('⚠️ Quiz submission failed (non-critical):', response.status);
          }
        } catch (submitError) {
          console.warn('⚠️ Quiz submission error (non-critical):', submitError);
          // Continue with game completion even if quiz submission fails
        }
      }
      
      // Track game completion if it has rewards and user passed (this is more important)
      if (gameId && quiz.hasReward && hasPassed) {
        try {
          const completionResponse = await fetch(`${backendUrl}/api/games/${userId}/${gameId}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              passed: hasPassed,
              score: finalScore,
              message: null, // No message if they didn't pass or claim reward
            }),
          });
          
          if (completionResponse.ok) {
            console.log('✅ Game completion tracked successfully');
          } else {
            console.warn('⚠️ Failed to track game completion:', completionResponse.status);
          }
        } catch (error) {
          console.error('❌ Error tracking game completion:', error);
        }
      }
      
      // Always call onComplete to continue the flow
      if (onComplete) {
        onComplete({ score: finalScore, passed: hasPassed });
      }
    } catch (error) {
      console.error('❌ Error in quiz submission flow:', error);
      // Still continue the flow even if there's an error
      if (onComplete) {
        onComplete({ score: finalScore, passed: hasPassed });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz || !quiz.questions) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
        <p className="text-white text-xl">Loading quiz...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const passed = score >= (quiz.settings?.passingScore || 70);
  const hasRewards = quiz.hasReward && quiz.rewards && quiz.rewards.length > 0;

  // Show reward flow if quiz is complete, passed, and has rewards
  if (showRewardFlow && hasRewards) {
    return (
      <RewardFlow
        rewards={quiz.rewards}
        userId={userId}
        letterId={letterId}
        gameId={gameId}
        gameType="quiz"
        passed={passed}
        startStep="selection"
        onComplete={() => {
          setShowRewardFlow(false);
          // Trigger games refresh in parent component
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('gameCompleted', { detail: { gameId: gameId, gameType: 'quiz' } }));
          }
          if (onComplete) {
            onComplete({ score, passed });
          }
          if (onBack) onBack();
        }}
        onBack={() => setShowRewardFlow(false)}
      />
    );
  }

  // Show GameCompletionScreen if quiz is complete, passed, and has rewards
  if (quizComplete && passed && hasRewards && !showRewardFlow) {
    return (
      <GameCompletionScreen
        onClaimReward={() => {
          setShowRewardFlow(true);
        }}
        onMaybeLater={() => {
          if (onComplete) {
            onComplete({ score, passed });
          }
          if (onBack) onBack();
        }}
      />
    );
  }

  // Show completion screen without rewards if quiz is complete but no rewards or didn't pass
  if (quizComplete) {
    return (
      <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%), linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%)",
              "radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%), linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
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
          className="relative z-10 text-center max-w-2xl mx-auto px-4"
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
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6"
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
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%), linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%)",
            "radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%), linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

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

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4">
        {/* Progress and Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/70 font-serif text-sm">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <motion.div
              animate={timeRemaining < 10 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`text-lg font-serif font-bold ${timeRemaining < 10 ? 'text-red-400' : 'text-white'}`}
            >
              ⏱️ {timeRemaining}s
            </motion.div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
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
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-6">
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
                    w-full text-left px-6 py-4 rounded-xl font-serif text-lg
                    transition-all duration-300
                    ${selectedAnswer === answer
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg border-2 border-blue-300'
                      : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
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
          className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-serif font-semibold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex + 1 >= quiz.questions.length ? 'Submit Quiz' : 'Next Question →'}
        </motion.button>
      </div>
    </div>
  );
}

