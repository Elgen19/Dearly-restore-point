// LoveQuizCreator.jsx - Create personalized love quiz
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import MessageModal from '../components/MessageModal';

export default function LoveQuizCreator({ onBack, quizToEdit, onSaved, skipSave = false }) {
  const { currentUser } = useAuth();
  const [quizTitle, setQuizTitle] = useState(quizToEdit?.title || '');
  const [questions, setQuestions] = useState(
    quizToEdit?.questions?.map((q, index) => ({
      id: index + 1,
      question: q.question,
      correctAnswer: q.correctAnswer,
      wrongAnswers: q.wrongAnswers || ['', '', '']
    })) || [{ id: 1, question: '', correctAnswer: '', wrongAnswers: ['', '', ''] }]
  );
  const [numWrongAnswers, setNumWrongAnswers] = useState(quizToEdit?.settings?.numWrongAnswers || 3);
  const [timeLimit, setTimeLimit] = useState(quizToEdit?.settings?.timeLimitPerQuestion || 10); // seconds per question
  const [passingScore, setPassingScore] = useState(quizToEdit?.settings?.passingScore || 70); // percentage
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', message: '', type: 'info' });

  // Memoize background hearts
  const backgroundHearts = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const fontSize = 20 + Math.random() * 40;
      return {
        id: i,
        left,
        top,
        fontSize,
      };
    });
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: questions.length + 1, 
        question: '', 
        correctAnswer: '', 
        wrongAnswers: Array(numWrongAnswers).fill('') 
      }
    ]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value, wrongAnswerIndex = null) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        if (wrongAnswerIndex !== null) {
          const newWrongAnswers = [...q.wrongAnswers];
          newWrongAnswers[wrongAnswerIndex] = value;
          return { ...q, wrongAnswers: newWrongAnswers };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const updateWrongAnswersCount = (newCount) => {
    setNumWrongAnswers(newCount);
    setQuestions(questions.map(q => ({
      ...q,
      wrongAnswers: q.wrongAnswers.slice(0, newCount).concat(
        Array(Math.max(0, newCount - q.wrongAnswers.length)).fill('')
      )
    })));
  };

  const showMessage = (title, message, type = 'info') => {
    setModalData({ title, message, type });
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validate
    if (!quizTitle.trim()) {
      showMessage('Missing Title', 'Please enter a quiz title', 'warning');
      return;
    }

    const validQuestions = questions.filter(q => 
      q.question.trim() && q.correctAnswer.trim() && 
      q.wrongAnswers.filter(wa => wa.trim()).length >= 2
    );

    if (validQuestions.length === 0) {
      showMessage('Incomplete Questions', 'Please add at least one complete question with a correct answer and at least 2 wrong answers', 'warning');
      return;
    }

    setIsSaving(true);

    const quizData = {
      title: quizTitle,
      questions: validQuestions.map(q => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        wrongAnswers: q.wrongAnswers.filter(wa => wa.trim()),
      })),
      settings: {
        timeLimitPerQuestion: timeLimit,
        passingScore: passingScore,
        numWrongAnswers: numWrongAnswers,
      },
    };

    // If skipSave is true, just pass data to callback without saving
    if (skipSave) {
      setIsSaving(false);
      if (onSaved) {
        onSaved(quizData);
      } else {
        onBack();
      }
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const url = quizToEdit 
        ? `${backendUrl}/api/quizzes/${currentUser.uid}/${quizToEdit.id}`
        : `${backendUrl}/api/quizzes/${currentUser.uid}`;
      const method = quizToEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quizData,
          createdAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        if (quizToEdit) {
          showMessage('Success! 🎉', 'Quiz updated successfully!', 'success');
        } else {
          showMessage('Success! 🎉', 'Quiz created successfully! Your loved one can now play it.', 'success');
        }
        setTimeout(() => {
          if (onSaved) {
            onSaved(quizData);
          } else {
            onBack();
          }
        }, 2000);
      } else {
        const error = await response.json();
        showMessage('Error', error.error || 'Failed to save quiz', 'error');
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      showMessage('Error', 'Failed to save quiz. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {backgroundHearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute text-pink-300/20"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              fontSize: `${heart.fontSize}px`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
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
              {quizToEdit ? 'Edit Love Quiz ❓' : 'Create Love Quiz ❓'}
            </motion.h1>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving}
              className="hidden md:flex px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white font-serif font-semibold transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : (quizToEdit ? 'Update Quiz' : 'Save Quiz')}
            </motion.button>
            <div className="w-10 h-10 md:hidden" /> {/* Spacer for mobile */}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 relative z-10">
        <div className="space-y-4 md:space-y-6">
          {/* Quiz Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
          >
            <label className="block text-base md:text-lg font-serif font-bold text-gray-800 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g., How Well Do You Know Me?"
              className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-lg border-2 border-rose-200 rounded-xl focus:border-rose-400 focus:outline-none font-serif"
            />
          </motion.div>

          {/* Game Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-serif font-bold text-gray-800 mb-4">
              Game Settings ⚙️
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-serif text-gray-700 mb-2">
                  Wrong Answers per Question
                </label>
                <select
                  value={numWrongAnswers}
                  onChange={(e) => updateWrongAnswersCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:outline-none"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-serif text-gray-700 mb-2">
                  Time Limit per Question (seconds)
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 10;
                    setTimeLimit(Math.max(1, Math.min(30, value)));
                  }}
                  min="1"
                  max="30"
                  className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-serif text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Math.max(0, Math.min(100, parseInt(e.target.value) || 70)))}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-serif font-bold text-gray-800">
                Questions ({questions.length})
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addQuestion}
                className="px-3 md:px-4 py-2 text-sm md:text-base bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-serif font-semibold shadow-lg"
              >
                + Add Question
              </motion.button>
            </div>

            <AnimatePresence>
              {questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-base md:text-lg font-serif font-bold text-gray-800">
                      Question {index + 1}
                    </h3>
                    {questions.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 text-lg md:text-xl"
                      >
                        🗑️
                      </motion.button>
                    )}
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-serif text-gray-700 mb-2">
                        Question
                      </label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                        placeholder="e.g., What's my favorite color?"
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-rose-200 rounded-lg focus:border-rose-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-serif text-gray-700 mb-2">
                        Correct Answer
                      </label>
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                        placeholder="The correct answer"
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-green-200 rounded-lg focus:border-green-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-serif text-gray-700 mb-2">
                        Wrong Answers
                      </label>
                      <div className="space-y-2">
                        {q.wrongAnswers.map((wrongAnswer, waIndex) => (
                          <input
                            key={waIndex}
                            type="text"
                            value={wrongAnswer}
                            onChange={(e) => updateQuestion(q.id, 'wrongAnswer', e.target.value, waIndex)}
                            placeholder={`Wrong answer ${waIndex + 1}`}
                            className="w-full px-3 md:px-4 py-2 text-sm md:text-base border-2 border-red-200 rounded-lg focus:border-red-400 focus:outline-none"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Save button at bottom of last question - mobile only */}
                  {index === questions.length - 1 && (
                    <div className="mt-6 md:hidden">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg disabled:opacity-50 transition-all"
                      >
                        {isSaving ? 'Saving...' : (quizToEdit ? 'Update Quiz' : 'Save Quiz')}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
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

