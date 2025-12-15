// ViewWriteBackResponses.jsx - Display all responses sent by the user
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function ViewWriteBackResponses({ onBack, onWriteNew, userId, receiverEmail, receiverName }) {
  const { currentUser } = useAuth();
  const [allResponses, setAllResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh
  const [editingResponse, setEditingResponse] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingResponseId, setDeletingResponseId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Memoize stars to prevent regeneration on every render
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

  // Memoize hearts to prevent regeneration on every render
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

  // Fetch all write-back responses
  const fetchAllResponses = async () => {
    if (!userId) {
      console.log('⚠️ ViewWriteBackResponses: No userId provided, cannot fetch responses');
      setIsLoading(false);
      return;
    }
    
    console.log('🔍 ViewWriteBackResponses: Fetching responses for userId:', userId);
    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const url = `${backendUrl}/api/letters/responses/all/${userId}`;
      console.log('🔍 ViewWriteBackResponses: Fetching from:', url);
      
      const response = await fetch(url);
      
      console.log('🔍 ViewWriteBackResponses: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ ViewWriteBackResponses: Received data:', Array.isArray(data) ? `${data.length} responses` : 'not an array', data);
        
        // Note: The API returns all responses from all letters owned by the sender
        // Since responses are stored under the sender's userId, all responses here
        // are responses written to this sender's letters
        // We show all of them (responses don't store receiverEmail for filtering)
        const responses = Array.isArray(data) ? data : [];
        console.log('✅ ViewWriteBackResponses: Setting responses:', responses.length);
        setAllResponses(responses);
      } else if (response.status === 404) {
        console.log('ℹ️ ViewWriteBackResponses: No responses found (404)');
        setAllResponses([]);
      } else {
        const errorText = await response.text();
        console.error('❌ ViewWriteBackResponses: Failed to fetch responses:', response.status, errorText);
        setAllResponses([]);
      }
    } catch (error) {
      console.error('❌ ViewWriteBackResponses: Error fetching all responses:', error);
      setAllResponses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      // Add a small delay to ensure userId is properly set (not a token)
      // This helps if the component renders before letter data is fully loaded
      const timer = setTimeout(() => {
        fetchAllResponses();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      console.log('⚠️ ViewWriteBackResponses: userId is not set, cannot fetch responses');
      setIsLoading(false);
    }
  }, [userId, refreshKey]);

  // Listen for refresh events (e.g., after creating a new response)
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 ViewWriteBackResponses: Refresh event received');
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('refreshWriteBackResponses', handleRefresh);
    return () => {
      window.removeEventListener('refreshWriteBackResponses', handleRefresh);
    };
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleEdit = (response) => {
    setEditingResponse(response);
    setEditContent(response.content || '');
  };

  const handleSaveEdit = async () => {
    if (!editingResponse || !editContent.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const url = `${backendUrl}/api/letters/${userId}/${editingResponse.letterId}/responses/${editingResponse.id || editingResponse.responseId}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (response.ok) {
        // Refresh the list
        setRefreshKey(prev => prev + 1);
        setEditingResponse(null);
        setEditContent("");
        if (selectedResponse && (selectedResponse.id === editingResponse.id || selectedResponse.responseId === editingResponse.id || selectedResponse.id === editingResponse.responseId)) {
          // Update selected response if it's the one being edited
          const updated = await response.json();
          setSelectedResponse(updated.response);
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to update response');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error updating response:', error);
      setErrorMessage('Failed to update response. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (response) => {
    setResponseToDelete(response);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!responseToDelete) return;

    const responseId = responseToDelete.id || responseToDelete.responseId;
    const letterId = responseToDelete.letterId;
    
    console.log('🗑️ Deleting response:', { userId, letterId, responseId, responseToDelete });

    setDeletingResponseId(responseId);
    setShowDeleteModal(false);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const url = `${backendUrl}/api/letters/${userId}/${letterId}/responses/${responseId}`;
      
      console.log('🗑️ DELETE request to:', url);
      
      const deleteResponse = await fetch(url, {
        method: 'DELETE',
      });

      console.log('🗑️ Delete response status:', deleteResponse.status);

      if (deleteResponse.ok) {
        // Refresh the list
        setRefreshKey(prev => prev + 1);
        // Clear selected response if it was deleted
        if (selectedResponse && (selectedResponse.id === responseId || selectedResponse.responseId === responseId)) {
          setSelectedResponse(null);
        }
      } else {
        // Try to parse error as JSON, fallback to text
        let errorMessage = 'Failed to delete response';
        try {
          const errorData = await deleteResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const errorText = await deleteResponse.text();
          console.error('Error response text:', errorText);
          errorMessage = `Failed to delete response (${deleteResponse.status})`;
        }
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting response:', error);
      setErrorMessage('Failed to delete response. Please try again.');
      setShowErrorModal(true);
    } finally {
      setDeletingResponseId(null);
      setResponseToDelete(null);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0"
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
          key={star.id}
          className="absolute bg-white rounded-full pointer-events-none"
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
          key={heart.id}
          className="absolute text-pink-300/40 pointer-events-none"
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

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Back Button - Outside card on desktop, hidden on mobile (handled inside card) */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedResponse) {
              setSelectedResponse(null);
              setEditingResponse(null);
            } else {
              onBack();
            }
          }}
          className={`hidden md:flex absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/20 shadow-lg transition-all group ${selectedResponse ? '' : ''}`}
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
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-4 h-full flex items-center justify-center">
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <AnimatePresence mode="wait">
          {selectedResponse ? (
            // Detailed View of Selected Response
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20 w-full max-h-[90vh] flex flex-col"
            >
              <div className="mb-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Back button - visible on mobile inside card */}
                    <button
                      onClick={() => {
                        setSelectedResponse(null);
                        setEditingResponse(null);
                      }}
                      className="md:hidden text-white/70 hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-xl md:text-2xl font-serif text-white flex-1">
                      Response to: {selectedResponse.letterTitle || 'Letter'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(selectedResponse)}
                      className="bg-blue-500/80 hover:bg-blue-500 text-white font-serif px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(selectedResponse)}
                      className="bg-red-500/80 hover:bg-red-500 text-white font-serif px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/60 text-xs md:text-sm font-serif flex-wrap">
                  <span>📅 {formatDate(selectedResponse.createdAt)}</span>
                  {selectedResponse.letterCreatedAt && (
                    <span>Original letter: {formatDate(selectedResponse.letterCreatedAt)}</span>
                  )}
                  {selectedResponse.updatedAt && selectedResponse.updatedAt !== selectedResponse.createdAt && (
                    <span className="text-white/40 italic">(Edited)</span>
                  )}
                </div>
              </div>
              
              {editingResponse && (editingResponse.id === selectedResponse.id || editingResponse.id === selectedResponse.responseId || editingResponse.responseId === selectedResponse.id) ? (
                <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10 flex-1 flex flex-col">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg p-4 text-white/90 font-serif text-sm md:text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    placeholder="Write your response..."
                    style={{ minHeight: '200px' }}
                  />
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving || !editContent.trim()}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-serif px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingResponse(null);
                        setEditContent("");
                      }}
                      disabled={isSaving}
                      className="bg-white/10 hover:bg-white/20 text-white font-serif px-4 py-2 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10 overflow-y-auto flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <p className="text-white/90 font-serif text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {selectedResponse.content || 'No content available'}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            // List View of All Responses
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20 w-full max-h-[90vh] flex flex-col relative"
            >
              {/* Back Button - Inside card on mobile for list view */}
              {onBack && (
                <div className="absolute top-4 left-4 z-50 md:hidden">
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
                </div>
              )}
              {/* Header */}
              <div className="text-center mb-4 flex-shrink-0">
                <h1 className="text-2xl md:text-3xl font-serif text-white mb-1 md:mb-2 flex items-center justify-center gap-2">
                  <span>✉️</span>
                  Your Responses
                </h1>
                <p className="text-gray-300 text-sm md:text-base font-serif italic">
                  All the letters you've written back
                </p>
              </div>

              {/* Write New Button */}
              {onWriteNew && (
                <div className="flex justify-center mb-4 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (onWriteNew) {
                        onWriteNew();
                      }
                    }}
                    className="w-auto min-w-[200px] max-w-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-serif text-base md:text-lg py-2.5 md:py-3 px-5 md:px-8 rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>✉️</span>
                    <span>Write a New Response</span>
                  </motion.button>
                </div>
              )}

              {/* Response Letters List */}
              {isLoading ? (
                <div className="text-center py-8 md:py-12 flex-1 flex items-center justify-center">
                  <div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="text-6xl mb-4 inline-block"
                    >
                      💌
                    </motion.div>
                    <p className="text-white/70 font-serif text-base md:text-lg">Loading your responses...</p>
                  </div>
                </div>
              ) : allResponses.length === 0 ? (
                <div className="text-center py-8 md:py-12 flex-1 flex items-center justify-center">
                  <div>
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-white/70 font-serif text-base md:text-lg mb-6">
                      You haven't written back yet. Click the button above to write your first response!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4 overflow-y-auto flex-1 min-h-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {allResponses.map((response, index) => (
                    <motion.div
                      key={response.id || response.responseId || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 hover:border-pink-300/50 transition-all hover:shadow-lg flex-shrink-0"
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="text-2xl md:text-3xl flex-shrink-0">✉️</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 md:mb-2 flex-wrap gap-2">
                            <h3 
                              className="text-base md:text-lg font-serif text-white truncate cursor-pointer"
                              onClick={() => setSelectedResponse(response)}
                            >
                              {response.letterTitle || 'Letter'}
                            </h3>
                            {response.createdAt && (
                              <p className="text-white/60 font-serif text-xs whitespace-nowrap">
                                {formatDate(response.createdAt)}
                              </p>
                            )}
                          </div>
                          {response.content && (
                            <p 
                              className="text-white/80 font-serif text-xs md:text-sm whitespace-pre-wrap line-clamp-2 md:line-clamp-3 cursor-pointer"
                              onClick={() => setSelectedResponse(response)}
                            >
                              {response.content}
                            </p>
                          )}
                          <p 
                            className="text-white/50 font-serif text-xs mt-1 md:mt-2 italic cursor-pointer"
                            onClick={() => setSelectedResponse(response)}
                          >
                            Click to read full response →
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
              className="bg-red-500/20 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border-2 border-red-500/50 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif text-white">Delete Response?</h3>
              </div>
              <p className="text-white/90 font-serif mb-6">
                Are you sure you want to delete this response? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-serif px-4 py-2 rounded-lg transition-all shadow-lg"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setResponseToDelete(null);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-serif px-4 py-2 rounded-lg transition-all border border-white/20"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 max-w-md w-full"
            >
              <h3 className="text-2xl font-serif text-white mb-4">Error</h3>
              <p className="text-white/80 font-serif mb-6">
                {errorMessage}
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-serif px-4 py-2 rounded-lg transition-all"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

