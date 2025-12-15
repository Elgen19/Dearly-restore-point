// VoiceMessage.jsx - Record and send voice messages
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceMessage({ onBack, userId, letterId, receiverName }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showVoiceList, setShowVoiceList] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
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

  // Fetch previous voice messages
  const fetchVoiceMessages = async () => {
    if (!userId || !letterId) return;
    
    setIsLoadingVoices(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/letters/${userId}/${letterId}/voice-messages`);
      if (response.ok) {
        const data = await response.json();
        // Convert object to array if needed
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const recordingsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setVoiceMessages(recordingsArray);
        } else {
          setVoiceMessages(Array.isArray(data) ? data : []);
        }
      } else if (response.status === 404) {
        setVoiceMessages([]);
      }
    } catch (err) {
      console.error('Error fetching voice messages:', err);
      setVoiceMessages([]);
    } finally {
      setIsLoadingVoices(false);
    }
  };
  const handleDeleteClick = (recording) => {
    setRecordingToDelete(recording);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordingToDelete) return;

    const { id: recordingId, fileName } = recordingToDelete;
    setShowDeleteModal(false);
    
    if (!userId || !letterId) {
      setError('Missing required information to delete recording.');
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/letters/${userId}/${letterId}/voice-messages/${recordingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });
      if (response.ok) {
        // Remove from local state
        setVoiceMessages(prev => prev.filter(r => r.id !== recordingId));
        // Refresh the list
        fetchVoiceMessages();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to delete recording');
      }
    } catch (error) {
      console.error('Error deleting voice recording:', error);
      setError('Failed to delete recording. Please try again.');
    } finally {
      setRecordingToDelete(null);
    }
  };

  // Load voice messages when component mounts or when showing list
  useEffect(() => {
    if (userId && letterId) {
      fetchVoiceMessages();
    }
  }, [userId, letterId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to access microphone. Please ensure you've granted microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setError(null);
    setSuccess(false);
  };

  const uploadVoiceMessage = async () => {
    if (!audioBlob || !userId || !letterId) {
      setError("Missing required information to upload voice message.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('audio', audioBlob, `voice-message-${Date.now()}.webm`);
      formData.append('letterId', letterId);
      formData.append('receiverName', receiverName || 'Receiver');

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/voice-upload/${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload voice message');
      }

      const result = await response.json();
      setUploadProgress(100);
      setSuccess(true);

      // Close after 2 seconds
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);

    } catch (err) {
      console.error("Error uploading voice message:", err);
      setError(err.message || "Failed to upload voice message. Please try again.");
    } finally {
      setIsUploading(false);
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

      {stars.map((star) => (
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

      {hearts.map((heart) => (
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

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Back Button */}
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
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ 
                scale: isRecording ? [1, 1.2, 1] : 1,
                rotate: isRecording ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                duration: 2, 
                repeat: isRecording ? Infinity : 0 
              }}
              className="text-6xl mb-4"
            >
              🎤
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">
              Record Voice Message
            </h1>
            <p className="text-gray-300 text-lg font-serif italic">
              Share your thoughts through your voice
            </p>
            {/* Toggle between record and list view */}
            <div className="mt-4 flex gap-2 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVoiceList(false)}
                className={`px-4 py-2 rounded-lg font-serif text-sm transition-all ${
                  !showVoiceList 
                    ? 'bg-violet-500/50 text-white border border-violet-400' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                }`}
              >
                Record
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVoiceList(true)}
                className={`px-4 py-2 rounded-lg font-serif text-sm transition-all ${
                  showVoiceList 
                    ? 'bg-violet-500/50 text-white border border-violet-400' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                }`}
              >
                My Recordings ({voiceMessages.length})
              </motion.button>
            </div>
          </div>

          {/* Recording Timer */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-6"
            >
              <div className="text-5xl font-serif text-white mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <span className="text-red-300 font-serif text-sm">Recording</span>
              </div>
            </motion.div>
          )}

          {/* Audio Preview */}
          {audioUrl && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full rounded-lg"
              />
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
            >
              <p className="text-red-200 font-serif text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center"
            >
              <p className="text-green-200 font-serif text-lg mb-2">✓ Voice message sent successfully!</p>
            </motion.div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6">
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-center text-white/70 font-serif text-sm mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Voice Messages List */}
          {showVoiceList && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 max-h-96 overflow-y-auto"
            >
              {isLoadingVoices ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-4xl mb-4 inline-block"
                  >
                    💕
                  </motion.div>
                  <p className="text-white/70 font-serif">Loading voice messages...</p>
                </div>
              ) : voiceMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-white/70 font-serif">No voice messages yet. Record your first message!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {voiceMessages.map((msg, index) => (
                    <motion.div
                      key={msg.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎤</span>
                          <span className="text-white/90 font-serif text-sm">
                            {msg.uploadedAt ? new Date(msg.uploadedAt).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(msg)}
                          className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-red-300 transition-all"
                          title="Delete recording"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                      {msg.url && (
                        <audio
                          src={msg.url}
                          controls
                          className="w-full rounded-lg mt-2"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Controls - Only show when not viewing list */}
          {!showVoiceList && (
            <div className="flex flex-col gap-4">
            {!audioBlob ? (
              // Recording Controls
              <>
                {!isRecording ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-full font-serif text-lg shadow-lg transition-all"
                  >
                    🎤 Start Recording
                  </motion.button>
                ) : (
                  <div className="flex gap-4">
                    {isPaused ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resumeRecording}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full font-serif shadow-lg transition-all"
                      >
                        ▶ Resume
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={pauseRecording}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-serif shadow-lg transition-all"
                      >
                        ⏸ Pause
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-full font-serif shadow-lg transition-all"
                    >
                      ⏹ Stop
                    </motion.button>
                  </div>
                )}
              </>
            ) : (
              // Review Controls
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={uploadVoiceMessage}
                  disabled={isUploading || success}
                  className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-full font-serif text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : success ? '✓ Sent!' : '📤 Send Voice Message'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetRecording}
                  disabled={isUploading || success}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-serif text-lg border border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔄 Record Again
                </motion.button>
              </>
            )}
          </div>
          )}
        </motion.div>
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
                <h3 className="text-2xl font-serif text-white">Delete Recording?</h3>
              </div>
              <p className="text-white/90 font-serif mb-6">
                Are you sure you want to delete this recording? This action cannot be undone.
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
                    setRecordingToDelete(null);
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
    </div>
  );
}

