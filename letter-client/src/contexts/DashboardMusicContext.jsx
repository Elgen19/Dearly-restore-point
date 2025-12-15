import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const DashboardMusicContext = createContext(null);

export function DashboardMusicProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Update volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Initialize audio when playlist changes
  useEffect(() => {
    if (audioRef.current && playlist.length > 0 && playlist[currentTrack]) {
      const wasPlaying = isPlaying;
      audioRef.current.src = playlist[currentTrack].url;
      audioRef.current.loop = false;
      audioRef.current.volume = volume;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));
      }
    } else if (audioRef.current && playlist.length === 0) {
      // Stop playing if playlist is empty
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [playlist, currentTrack]);

  // Handle track changes
  useEffect(() => {
    if (audioRef.current && playlist[currentTrack]) {
      const wasPlaying = isPlaying;
      audioRef.current.src = playlist[currentTrack].url;
      audioRef.current.loop = false;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));
      }
    }
  }, [currentTrack]);

  const togglePlayPause = () => {
    if (audioRef.current && playlist.length > 0) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.log("Audio play failed:", err);
            setIsPlaying(false);
          });
      }
    }
  };

  const nextTrack = () => {
    if (playlist.length > 0) {
      setCurrentTrack((prev) => (prev + 1) % playlist.length);
    }
  };

  const previousTrack = () => {
    if (playlist.length > 0) {
      setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleEnded = () => {
    // Auto-play next track when current track ends
    if (playlist.length > 0) {
      nextTrack();
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.log("Auto-play failed:", err));
        }
      }, 100);
    }
  };

  // Set playlist from letter data
  const setPlaylistFromLetter = (dashboardMusicArray) => {
    if (Array.isArray(dashboardMusicArray) && dashboardMusicArray.length > 0) {
      // Convert URLs to playlist format
      const newPlaylist = dashboardMusicArray.map((url, index) => ({
        id: `track-${index}`,
        name: `Track ${index + 1}`,
        url: url,
      }));
      
      // Only update if playlist has changed (compare URLs)
      const currentUrls = playlist.map(t => t.url).sort();
      const newUrls = newPlaylist.map(t => t.url).sort();
      const playlistChanged = JSON.stringify(currentUrls) !== JSON.stringify(newUrls);
      
      if (playlistChanged) {
        setPlaylist(newPlaylist);
        setCurrentTrack(0);
        // Auto-play if not already playing
        if (!isPlaying && newPlaylist.length > 0) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                })
                .catch(err => {
                  console.log("Auto-play prevented:", err);
                });
            }
          }, 500);
        }
      }
    } else {
      // Only clear if playlist was not empty
      if (playlist.length > 0) {
        setPlaylist([]);
        setIsPlaying(false);
      }
    }
  };

  // Auto-play music when OptionsPage is shown
  const startPlaying = () => {
    if (audioRef.current && !isPlaying && playlist.length > 0) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.log("Auto-play prevented:", err);
        });
    }
  };

  const value = {
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    playlist,
    togglePlayPause,
    nextTrack,
    previousTrack,
    handleVolumeChange,
    toggleMute,
    startPlaying,
    setPlaylistFromLetter,
  };

  return (
    <DashboardMusicContext.Provider value={value}>
      {children}
      {/* Hidden Audio Element - stays mounted at app level */}
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      >
        {playlist[currentTrack] && (
          <source src={playlist[currentTrack].url} type="audio/mpeg" />
        )}
      </audio>
    </DashboardMusicContext.Provider>
  );
}

export function useDashboardMusic() {
  const context = useContext(DashboardMusicContext);
  if (!context) {
    throw new Error("useDashboardMusic must be used within a DashboardMusicProvider");
  }
  return context;
}

