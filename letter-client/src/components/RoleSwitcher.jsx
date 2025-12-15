// RoleSwitcher.jsx - Component to switch between Receiver and Sender modes
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const { currentUser } = useAuth();
  
  // Only show switcher if user is logged in
  if (!currentUser) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/30 shadow-lg"
    >
      <motion.button
        onClick={() => {
          console.log('🔄 RoleSwitcher: Receiver button clicked');
          onRoleChange('receiver');
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-full font-serif text-sm font-medium transition-all ${
          currentRole === 'receiver'
            ? 'bg-white/30 text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        📥 Receiver
      </motion.button>
      
      <div className="w-px h-6 bg-white/30" />
      
      <motion.button
        onClick={() => {
          console.log('🔄 RoleSwitcher: Sender button clicked');
          onRoleChange('sender');
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-full font-serif text-sm font-medium transition-all ${
          currentRole === 'sender'
            ? 'bg-white/30 text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        ✉️ Sender
      </motion.button>
    </motion.div>
  );
}

