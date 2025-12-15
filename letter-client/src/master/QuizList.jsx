// QuizList.jsx - List of quizzes with create, edit, delete functionality
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoveQuizCreator from './LoveQuizCreator';
import MessageModal from '../components/MessageModal';

export default function QuizList({ onBack }) {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalData, setMessageModalData] = useState({ title: '', message: '', type: 'info' });

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

  // Fetch quizzes
  useEffect(() => {
    if (!currentUser) return;

    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/quizzes/${currentUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data.quizzes || []);
        } else {
          console.error('Failed to fetch quizzes');
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [currentUser]);

  const showMessage = (title, message, type = 'info') => {
    setMessageModalData({ title, message, type });
    setShowMessageModal(true);
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/quizzes/${currentUser.uid}/${quizToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));
        showMessage('Success!', 'Quiz deleted successfully', 'success');
        setShowDeleteModal(false);
        setQuizToDelete(null);
      } else {
        const error = await response.json();
        showMessage('Error', error.error || 'Failed to delete quiz', 'error');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showMessage('Error', 'Failed to delete quiz. Please try again.', 'error');
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setShowCreateForm(true);
  };

  const handleCreate = () => {
    setEditingQuiz(null);
    setShowCreateForm(true);
  };

  const handleQuizSaved = () => {
    // Refresh quizzes list
    const fetchQuizzes = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/quizzes/${currentUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data.quizzes || []);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };
    fetchQuizzes();
    setShowCreateForm(false);
    setEditingQuiz(null);
  };

  if (showCreateForm) {
    return (
      <LoveQuizCreator
        onBack={() => {
          setShowCreateForm(false);
          setEditingQuiz(null);
        }}
        quizToEdit={editingQuiz}
        onSaved={handleQuizSaved}
      />
    );
  }

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
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

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
              My Love Quizzes ❓
            </motion.h1>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white font-serif font-semibold transition-all shadow-lg"
            >
              + Create Quiz
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-serif text-lg">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">❓</div>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
              No Quizzes Yet
            </h2>
            <p className="text-gray-600 font-serif mb-6">
              Create your first love quiz to surprise your loved one!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg"
            >
              Create Your First Quiz
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-rose-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">❓</div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(quiz)}
                      className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                      title="Edit quiz"
                    >
                      ✏️
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setQuizToDelete(quiz);
                        setShowDeleteModal(true);
                      }}
                      className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                      title="Delete quiz"
                    >
                      🗑️
                    </motion.button>
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">
                  {quiz.title}
                </h3>
                <p className="text-gray-600 font-serif text-sm mb-4">
                  {quiz.questions?.length || 0} questions
                </p>
                <p className="text-gray-400 text-xs font-serif">
                  Created {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && quizToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🗑️</div>
                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                  Delete Quiz?
                </h2>
                <p className="text-gray-600 font-serif mb-6">
                  Are you sure you want to delete "{quizToDelete.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-serif font-semibold transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full font-serif font-semibold transition-all shadow-lg"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={messageModalData.title}
        message={messageModalData.message}
        type={messageModalData.type}
      />
    </div>
  );
}

