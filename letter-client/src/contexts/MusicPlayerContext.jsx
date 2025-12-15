import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import romanticMusic from "../music/romantic-music-1.mp3";
import romanticMusic2 from "../music/romantic-music-2.mp3";

const MusicPlayerContext = createContext(null);

export function MusicPlayerProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Playlist - add more music files here as you add them to the music folder
  const playlist = [
    { name: "Pagsamo by Arthur Nery", src: romanticMusic },
    { name: "Walang Kapalit cover by Arthur Nery", src: romanticMusic2 },
    // Add more tracks here when you have more MP3 files
  ];

  // Update volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Initialize audio when component mounts
  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      audioRef.current.src = playlist[currentTrack].src;
      audioRef.current.loop = false;
      audioRef.current.volume = volume;
      audioRef.current.load();
    }
  }, []);

  // Handle track changes
  useEffect(() => {
    if (audioRef.current && playlist[currentTrack]) {
      const wasPlaying = isPlaying;
      audioRef.current.src = playlist[currentTrack].src;
      audioRef.current.loop = false;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));
      }
    }
  }, [currentTrack]);

  const togglePlayPause = () => {
    if (audioRef.current) {
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
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const previousTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
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
    nextTrack();
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log("Auto-play failed:", err));
      }
    }, 100);
  };

  // Auto-play music when OptionsPage is shown (triggered from OptionsPage)
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
  };

  return (
    <MusicPlayerContext.Provider value={value}>
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
          <source src={playlist[currentTrack].src} type="audio/mpeg" />
        )}
      </audio>
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
}

