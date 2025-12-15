// ClosingPreviewSelector.jsx - Component to show closing previews and allow selection
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClosingPreviewV1 from "./ClosingPreviewV1";
import ClosingPreviewV2 from "./ClosingPreviewV2";
import ClosingPreviewV3 from "./ClosingPreviewV3";

export default function ClosingPreviewSelector({ 
  closing, 
  receiverName = "",
  onSelect
}) {
  const [selectedVersion, setSelectedVersion] = useState(1);
  
  const versions = [
    { id: 1, name: "Heart Reveal", description: "Romantic and dreamy", component: ClosingPreviewV1 },
    { id: 2, name: "Ethereal Glow", description: "Mystical and enchanting", component: ClosingPreviewV2 },
    { id: 3, name: "Wave Cascade", description: "Flowing and graceful", component: ClosingPreviewV3 },
  ];
  
  const SelectedComponent = versions.find(v => v.id === selectedVersion)?.component || ClosingPreviewV1;
  
  const handleSelect = (versionId) => {
    setSelectedVersion(versionId);
  };
  
  const handleConfirm = () => {
    onSelect(selectedVersion);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96, visibility: "hidden" }}
      animate={{ opacity: 1, y: 0, scale: 1, visibility: "visible" }}
      exit={{ 
        opacity: 0,
        visibility: "hidden",
        transition: { duration: 0, ease: "linear" } 
      }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: 'opacity, transform, visibility' }}
      className="h-full w-full flex flex-col"
    >
      {/* Preview Area - Full page, no borders */}
      <div className="flex-1 w-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedVersion}
            initial={{ opacity: 0, scale: 0.96, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.15, ease: "easeIn" } 
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ willChange: 'opacity, transform' }}
            className="h-full w-full"
          >
            <SelectedComponent 
              closing={closing} 
              receiverName={receiverName} 
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Selection Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-shrink-0 px-4 py-6 w-full"
      >
        <div className="flex flex-wrap gap-2 justify-between items-center w-full">
          {/* Version Selection Buttons - Centered */}
          <div className="flex flex-wrap gap-2 justify-center flex-1">
            {versions.map((version) => (
              <motion.button
                key={version.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(version.id)}
                className={`px-4 py-2 rounded-lg font-serif text-sm transition-all border ${
                  selectedVersion === version.id
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm'
                }`}
              >
                {version.name}
              </motion.button>
            ))}
          </div>
          
          {/* Select This Style Button - Rightmost */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirm}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #ec4899, #f43f5e, #ec4899)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          >
            <style>{`
              @keyframes shimmer {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
            `}</style>
            <span className="relative z-10">Select This Style →</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

