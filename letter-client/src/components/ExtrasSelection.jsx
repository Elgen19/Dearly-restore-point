// ExtrasSelection.jsx - Select extras like musical background
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function ExtrasSelection({ 
  selectedMusic, 
  onMusicSelect,
  selectedLetterMusic,
  onLetterMusicSelect,
  selectedDashboardMusic,
  onDashboardMusicSelect,
  onContinue,
  onBack,
  onDateSetup,
  onGameSetup,
  onDateEdit,
  onGameEdit,
  refreshTrigger
}) {
  const { currentUser } = useAuth();
  const [previewingMusic, setPreviewingMusic] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedMusic, setUploadedMusic] = useState(null); // Store uploaded music URL
  const [userMusicLibrary, setUserMusicLibrary] = useState([]); // Store user's previously uploaded music
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [dateInvitations, setDateInvitations] = useState([]);
  const [games, setGames] = useState([]);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch date invitations and games
  useEffect(() => {
    const fetchDateInvitations = async () => {
      if (!currentUser) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/date-invitations`);
        if (response.ok) {
          const data = await response.json();
          // Filter out pending invitations - only show responded ones
          const respondedInvitations = Array.isArray(data) 
            ? data.filter(inv => inv.status !== "pending")
            : [];
          setDateInvitations(respondedInvitations);
        }
      } catch (error) {
        console.error('Error fetching date invitations:', error);
      }
    };

    const fetchGames = async () => {
      if (!currentUser) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/games/${currentUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          // Only show games that are not yet attached to a letter (newly created from extras)
          const newGames = (data.games || []).filter(game => !game.letterId);
          setGames(newGames);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchDateInvitations();
    fetchGames();
  }, [currentUser, refreshTrigger]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Don't fetch existing dates or games - treat everything as new
  // Date invitations and games will be empty arrays by default

  const handleMusicPreview = (musicUrl, musicId) => {
    // Stop current preview if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (!musicUrl) {
      setPreviewingMusic(null);
      return;
    }

    // Start new preview - handle URLs
    if (musicUrl) {
      const audio = new Audio(musicUrl);
      audio.loop = true;
      audio.play().catch(err => console.log("Audio play failed:", err));
      audioRef.current = audio;
      setPreviewingMusic(musicId);
    }
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPreviewingMusic(null);
  };

  const handleSelectMusic = (musicUrl) => {
    // Legacy support - if onMusicSelect exists, use it
    if (onMusicSelect) {
      onMusicSelect(musicUrl || null);
    }
    stopPreview();
  };

  const handleSelectLetterMusic = (musicUrl) => {
    if (onLetterMusicSelect) {
      onLetterMusicSelect(musicUrl || null);
    }
    stopPreview();
  };

  const handleSelectDashboardMusic = (musicUrl, isSelected) => {
    if (onDashboardMusicSelect) {
      const currentSelection = selectedDashboardMusic || [];
      if (isSelected) {
        // Remove from selection
        onDashboardMusicSelect(currentSelection.filter(url => url !== musicUrl));
      } else {
        // Add to selection
        onDashboardMusicSelect([...currentSelection, musicUrl]);
      }
    }
    stopPreview();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a'];
    const isValidType = allowedTypes.includes(file.type) || /\.(mp3|wav|ogg|aac|m4a)$/i.test(file.name);

    if (!isValidType) {
      setUploadError('Invalid file type. Please upload an audio file (mp3, wav, ogg, aac, m4a).');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }

    uploadMusicFile(file);
  };

  const uploadMusicFile = async (file) => {
    if (!currentUser) {
      setUploadError('You must be logged in to upload music.');
      return;
    }

    setUploadingFile(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('music', file);

      const response = await fetch(`${backendUrl}/api/music-upload/${currentUser.uid}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload music file');
      }

      const result = await response.json();
      
      if (result.success && result.file) {
        // Store the uploaded music URL (full URL including backend URL)
        const fullUrl = result.file.url.startsWith('http') 
          ? result.file.url 
          : `${backendUrl}${result.file.url}`;
        
        setUploadedMusic({
          id: `uploaded-${result.file.filename}`,
          name: result.file.originalName || 'Uploaded Music',
          url: fullUrl,
          emoji: '🎵'
        });
        
        // Don't auto-select - let user choose which section to add it to
        setUploadProgress(100);
        // Refresh the music library to include the new upload
        // The fetchUserMusicLibrary function will handle clearing uploadedMusic if it's in the library
        await fetchUserMusicLibrary();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading music file:', error);
      setUploadError(error.message || 'Failed to upload music file. Please try again.');
    } finally {
      setUploadingFile(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const fetchUserMusicLibrary = async () => {
    if (!currentUser) return;

    setLoadingLibrary(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/music-upload/list/${currentUser.uid}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.files && result.files.length > 0) {
          // Convert to format expected by the component
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          const musicFiles = result.files.map((file) => {
            // Normalize URL to ensure consistent format
            let normalizedUrl = file.url;
            if (!normalizedUrl.startsWith('http')) {
              normalizedUrl = normalizedUrl.startsWith('/') 
                ? `${backendUrl}${normalizedUrl}`
                : `${backendUrl}/${normalizedUrl}`;
            }
            return {
              id: file.id || `uploaded-${file.filename}`,
              name: file.originalName || 'Uploaded Music',
              url: normalizedUrl,
              emoji: '🎵',
              uploadedAt: file.uploadedAt,
              filename: file.filename, // Store filename for deletion
              storagePath: file.storagePath, // Store storage path for deletion
            };
          });
          
          // Remove duplicates based on URL to prevent showing the same song twice
          const uniqueMusicFiles = musicFiles.filter((file, index, self) => 
            index === self.findIndex((f) => {
              // Normalize URLs for comparison (remove query params, trailing slashes, etc.)
              const normalizeUrl = (url) => {
                if (!url) return '';
                try {
                  const urlObj = new URL(url);
                  return urlObj.origin + urlObj.pathname;
                } catch {
                  return url.replace(/\/$/, '').split('?')[0];
                }
              };
              return normalizeUrl(f.url) === normalizeUrl(file.url);
            })
          );
          
          setUserMusicLibrary(uniqueMusicFiles);
          
          // Always clear uploadedMusic after library refresh to prevent duplicate display
          // Once the music is in the library, it will show there instead of as a separate "uploaded" item
          setUploadedMusic(null);
        } else {
          // Even if no files, clear uploadedMusic to prevent any display issues
          setUploadedMusic(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user music library:', error);
    } finally {
      setLoadingLibrary(false);
    }
  };

  // Delete music file handler
  const handleDeleteMusic = async (music) => {
    if (!currentUser || !music.filename) {
      console.error('Cannot delete: missing user or filename');
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${music.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/music-upload/${currentUser.uid}/${music.filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete music file');
      }

      // Stop preview if the deleted music was playing
      if (previewingMusic === music.id) {
        stopPreview();
      }

      // Remove from selections if it was selected
      if (selectedLetterMusic === music.url && onLetterMusicSelect) {
        onLetterMusicSelect(null);
      }
      if (selectedDashboardMusic && selectedDashboardMusic.includes(music.url) && onDashboardMusicSelect) {
        onDashboardMusicSelect(selectedDashboardMusic.filter(url => url !== music.url));
      }

      // Refresh the library to update the UI
      await fetchUserMusicLibrary();
    } catch (error) {
      console.error('Error deleting music file:', error);
      alert(`Failed to delete music file: ${error.message}`);
    }
  };

  // Fetch user's previously uploaded music on mount
  useEffect(() => {
    if (currentUser) {
      fetchUserMusicLibrary();
    }
  }, [currentUser]);

  const handleContinue = () => {
    stopPreview();
    onContinue();
  };

  return (
    <>
      <style>{`
        .extras-scroll-wrapper {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .extras-scroll-wrapper::-webkit-scrollbar {
          width: 14px;
        }
        .extras-scroll-wrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 7px;
          margin: 4px 4px 4px 0;
        }
        .extras-scroll-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 7px;
          border: 2px solid transparent;
          background-clip: padding-box;
          min-height: 40px;
        }
        .extras-scroll-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.7);
          background-clip: padding-box;
        }
        .extras-scroll-wrapper::-webkit-scrollbar-thumb:active {
          background: rgba(255, 255, 255, 0.9);
          background-clip: padding-box;
        }
        .extras-scroll-wrapper {
          scrollbar-width: auto;
          scrollbar-color: rgba(255, 255, 255, 0.5) rgba(255, 255, 255, 0.1);
        }
        .extras-content-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          padding-bottom: 2rem;
          max-width: 64rem;
          margin: 0 auto;
        }
      `}</style>
      <div className="extras-scroll-wrapper">
        <div className="extras-content-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8 flex-shrink-0"
      >
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
          Add Extras
        </h2>
        <p className="text-gray-300 text-lg font-serif italic">
          Make your letter even more special
        </p>
      </motion.div>

      {/* Upload Music Section - Shared for both sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-4xl mb-8 flex-shrink-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border-2 border-white/30 shadow-lg"
        >
          <h4 className="text-lg font-serif font-bold text-white mb-2 text-center">
            📤 Upload Your Own Music
          </h4>
          <p className="text-gray-300 text-sm font-serif text-center mb-4 italic">
            Upload audio files to use for letter or dashboard music (MP3, WAV, OGG, AAC, M4A) - Max 10MB per file
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a,.mp3,.wav,.ogg,.aac,.m4a"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUploadClick}
            disabled={uploadingFile}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-serif font-semibold text-base shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploadingFile ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Uploading... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Choose Music File</span>
              </>
            )}
          </motion.button>

          {/* Upload error */}
          {uploadError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-red-400 text-sm font-serif text-center"
            >
              {uploadError}
            </motion.p>
          )}

          {/* Loading state */}
          {loadingLibrary && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm font-serif">Loading your music library...</p>
            </div>
          )}

          {/* Uploaded music display */}
          {uploadedMusic && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-500/20 border border-green-400/30 rounded-lg"
            >
              <p className="text-green-300 text-sm font-serif text-center">
                ✅ {uploadedMusic.name} uploaded successfully! You can now select it below.
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Letter Music Selection - Single Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-4xl mb-8 flex-shrink-0"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-white/20 p-6">
          <h3 className="text-xl font-serif font-bold text-white mb-2 text-center">
            💌 Letter Background Music
          </h3>
          <p className="text-gray-300 text-sm font-serif text-center mb-6 italic">
            Choose <span className="font-semibold text-white">one</span> song to play during letter reading (from introductory to end)
          </p>

          {/* Section Label for Uploaded Music */}
          {userMusicLibrary.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base font-serif font-semibold text-white/80 text-center">
                📚 Your Music Library
              </h4>
            </div>
          )}

          {/* Letter Music Selection Cards */}
          <div className="flex flex-wrap justify-center gap-3 w-full mb-6">
          {/* Show user's previously uploaded music for Letter Music */}
          {userMusicLibrary.map((music) => {
            const isSelected = selectedLetterMusic === music.url;
            return (
              <motion.div
                key={`letter-${music.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer rounded-xl p-4 bg-white/10 backdrop-blur-md border-2 transition-all w-full max-w-[280px] box-border ${
                  isSelected
                    ? 'border-pink-400 bg-white/20 shadow-lg ring-2 ring-pink-400/50'
                    : 'border-white/30 hover:border-white/50 shadow-md hover:shadow-lg'
                }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg z-10"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMusic(music);
                  }}
                  className="absolute top-2 left-2 w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg z-10"
                  title="Delete this music file"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>

                {/* Music Icon */}
                <div className="text-4xl mb-2 text-center">{music.emoji}</div>

                {/* Music Name */}
                <h4 className="text-base font-serif font-semibold text-white text-center mb-3 line-clamp-2">
                  {music.name}
                </h4>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (previewingMusic === music.id) {
                        stopPreview();
                      } else {
                        handleMusicPreview(music.url, music.id);
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg font-serif text-sm transition-all ${
                      previewingMusic === music.id
                        ? 'bg-pink-500 hover:bg-pink-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {previewingMusic === music.id ? '⏸ Stop' : '▶ Play'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLetterMusic(music.url);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg font-serif text-sm transition-all ${
                      isSelected
                        ? 'bg-pink-500 hover:bg-pink-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}


          {/* No Music Option for Letter Music */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`relative cursor-pointer rounded-xl p-4 bg-white/10 backdrop-blur-md border-2 transition-all w-full max-w-[280px] box-border ${
              !selectedLetterMusic
                ? 'border-pink-400 bg-white/20 shadow-lg ring-2 ring-pink-400/50'
                : 'border-white/30 hover:border-white/50 shadow-md hover:shadow-lg'
            }`}
          >
            {/* Selection Indicator */}
            {!selectedLetterMusic && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}

            {/* Music Icon */}
            <div className="text-4xl mb-2 text-center">🔇</div>

            {/* Music Name */}
            <h4 className="text-base font-serif font-semibold text-white text-center mb-3">
              No Music
            </h4>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectLetterMusic(null);
                }}
                className={`w-full px-3 py-2 rounded-lg font-serif text-sm transition-all ${
                  !selectedLetterMusic
                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {!selectedLetterMusic ? 'Selected' : 'Select'}
              </motion.button>
            </div>
          </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Music Selection - Multiple Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-4xl mb-8 flex-shrink-0"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-white/20 p-6">
          <h3 className="text-xl font-serif font-bold text-white mb-2 text-center">
            🎵 Dashboard Background Music
          </h3>
          <p className="text-gray-300 text-sm font-serif text-center mb-6 italic">
            Select <span className="font-semibold text-white">multiple</span> songs to play in the dashboard (plays automatically), or choose "No Music" to continue without background music
          </p>
          
          {/* Section Label for Uploaded Music */}
          {userMusicLibrary.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base font-serif font-semibold text-white/80 text-center">
                📚 Your Music Library
              </h4>
            </div>
          )}

          {/* Dashboard Music Selection Cards */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
          {/* Show user's previously uploaded music for Dashboard Music */}
          {userMusicLibrary.map((music) => {
            const isSelected = selectedDashboardMusic && selectedDashboardMusic.includes(music.url);
            return (
              <motion.div
                key={`dashboard-${music.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer rounded-xl p-4 bg-white/10 backdrop-blur-md border-2 transition-all w-full max-w-[280px] box-border ${
                  isSelected
                    ? 'border-pink-400 bg-white/20 shadow-lg ring-2 ring-pink-400/50'
                    : 'border-white/30 hover:border-white/50 shadow-md hover:shadow-lg'
                }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg z-10"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMusic(music);
                  }}
                  className="absolute top-2 left-2 w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg z-10"
                  title="Delete this music file"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>

                {/* Music Icon */}
                <div className="text-4xl mb-2 text-center">{music.emoji}</div>

                {/* Music Name */}
                <h4 className="text-base font-serif font-semibold text-white text-center mb-3 line-clamp-2">
                  {music.name}
                </h4>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (previewingMusic === music.id) {
                        stopPreview();
                      } else {
                        handleMusicPreview(music.url, music.id);
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg font-serif text-sm transition-all ${
                      previewingMusic === music.id
                        ? 'bg-pink-500 hover:bg-pink-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {previewingMusic === music.id ? '⏸ Stop' : '▶ Play'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDashboardMusic(music.url, isSelected);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg font-serif text-sm transition-all ${
                      isSelected
                        ? 'bg-pink-500 hover:bg-pink-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {isSelected ? 'Added' : 'Add'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}


          {/* No Music Option for Dashboard - Always available */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`relative cursor-pointer rounded-xl p-4 bg-white/10 backdrop-blur-md border-2 transition-all w-full max-w-[280px] box-border ${
              (!selectedDashboardMusic || selectedDashboardMusic.length === 0)
                ? 'border-pink-400 bg-white/20 shadow-lg ring-2 ring-pink-400/50'
                : 'border-white/30 hover:border-white/50 shadow-md hover:shadow-lg'
            }`}
          >
            {/* Selection Indicator */}
            {(!selectedDashboardMusic || selectedDashboardMusic.length === 0) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}

            {/* Music Icon */}
            <div className="text-4xl mb-2 text-center">🔇</div>

            {/* Music Name */}
            <h4 className="text-base font-serif font-semibold text-white text-center mb-3">
              No Music
            </h4>

            {/* Description */}
            <p className="text-white/70 text-xs font-serif text-center mb-3">
              Continue without dashboard music
            </p>

            {/* Action Button */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Clear all dashboard music selections
                  if (onDashboardMusicSelect) {
                    onDashboardMusicSelect([]);
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg font-serif text-sm transition-all ${
                  (!selectedDashboardMusic || selectedDashboardMusic.length === 0)
                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {(!selectedDashboardMusic || selectedDashboardMusic.length === 0) ? 'Selected' : 'Clear All'}
              </motion.button>
            </div>
          </motion.div>
        </div>
        </div>
      </motion.div>


      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl flex-shrink-0 mt-auto py-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          className="w-full sm:w-auto flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-base shadow-lg transition-all overflow-hidden group relative"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            🔗 Continue to Generate Link
          </span>
        </motion.button>
      </motion.div>
        </div>
      </div>
    </>
  );
}
