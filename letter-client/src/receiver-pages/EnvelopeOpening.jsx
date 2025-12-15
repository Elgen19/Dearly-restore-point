// EnvelopeOpening.jsx - Envelope opening animation
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnvelopeOpening({ onEnvelopeOpened }) {
  const [sealBroken, setSealBroken] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [letterExtracted, setLetterExtracted] = useState(false);

  const breakSeal = () => {
    setSealBroken(true);
    setTimeout(() => {
      setFlapOpen(true);
    }, 600);
  };

  const extractLetter = useCallback(() => {
    if (flapOpen && !letterExtracted) {
      setLetterExtracted(true);
      setTimeout(() => {
        // Notify parent that envelope is fully opened and letter is ready
        if (onEnvelopeOpened) {
          onEnvelopeOpened();
        }
      }, 800);
    }
  }, [flapOpen, letterExtracted, onEnvelopeOpened]);

  // Auto-extract letter after flap opens
  useEffect(() => {
    if (flapOpen && !letterExtracted) {
      const timer = setTimeout(() => {
        extractLetter();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [flapOpen, letterExtracted, extractLetter]);

  return (
    <motion.div
      key="envelope"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative mx-auto"
      style={{ perspective: "1200px", perspectiveOrigin: "center center" }}
    >
      {/* Envelope Container - Realistic envelope design */}
      <div className="relative w-[700px] h-[400px] mx-auto" style={{ perspective: "1500px" }}>
        {/* Letter is completely hidden inside envelope - not visible until extracted */}

        {/* Envelope Body - Cream color */}
        <div className="absolute bottom-0 w-full h-[70%]" style={{ zIndex: 10 }}>
          {/* Solid background layer - ensures opacity */}
          <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-stone-50 via-stone-50 to-stone-50" />
          
          {/* Main envelope body - Cream background */}
          <div 
            className="absolute bottom-0 w-full h-full shadow-lg"
            style={{
              backgroundImage: `
                url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InRleHR1cmUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxODUsIDEzNywgMTEsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN0ZXh0dXJlKSIvPjwvc3ZnPg==')
              `,
              backgroundColor: "rgb(255, 253, 250)", // Cream color
            }}
          >
            {/* Subtle inner shadow */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-200/20 via-transparent to-transparent" />
            {/* Top edge where flap connects */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-stone-300/30 to-transparent" />
            
            {/* Decorative corner elements - More visible */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-stone-500/70" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-stone-500/70" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-stone-500/70" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-stone-500/70" />
            
            {/* Address text - Real address details */}
            <div className="absolute top-8 left-8 right-20">
              <div className="text-stone-600/80 text-xs font-serif mb-1">To: Faith</div>
              <div className="text-stone-600/80 text-xs font-serif mb-1">123 Memory Lane</div>
              <div className="text-stone-600/80 text-xs font-serif">City of Dreams, 12345</div>
            </div>
            
            {/* Postage stamp area (top right) - More detailed */}
            <div className="absolute top-6 right-6 w-20 h-24 border-2 border-dashed border-stone-500/70 rounded-sm bg-stone-50/50">
              <div className="absolute inset-1 border border-stone-500/50 rounded-sm" />
              <div className="absolute top-1 left-1 right-1 text-[6px] text-stone-600/80 font-serif text-center font-bold uppercase tracking-wide">Postage</div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] text-stone-700/90 font-serif font-bold">$0.68</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[5px] text-stone-500/70 font-serif">Forever</div>
            </div>
            
            {/* Subtle decorative border pattern - More visible */}
            <div className="absolute inset-0 border border-stone-400/40" />
          </div>
        </div>

        {/* Envelope Flap - Smaller and rounder */}
        <motion.div
          className="absolute left-0 w-full h-[50%] cursor-pointer"
          style={{
            top: "calc(100% - 70%)",
            transformStyle: "preserve-3d",
            transformOrigin: "top center",
            zIndex: 30,
          }}
          animate={{
            rotateX: flapOpen ? 120 : 0,
            zIndex: flapOpen ? 5 : 30,
          }}
          transition={{
            duration: 1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          onClick={!sealBroken ? breakSeal : undefined}
        >
          {/* Flap outer side - Rounded triangular shape with cream color and outline */}
          <div
            className="absolute inset-0 shadow-2xl"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 98% 2%, 52% 98%, 50% 100%, 48% 98%, 2% 2%)",
              backfaceVisibility: "hidden",
              backgroundColor: "rgb(255, 253, 250)", // Cream color
              background: "linear-gradient(to bottom, rgb(255, 253, 250) 0%, rgb(255, 253, 250) 50%, rgb(255, 253, 250) 100%)", // Solid cream
              border: "3px solid rgba(180, 160, 140, 0.8)", // Visible outline
              outline: "1px solid rgba(200, 180, 160, 0.6)", // Additional outline for visibility
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(160, 140, 120, 0.4)",
            }}
          >
            
            {/* Top edge highlight */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-stone-100/40 to-transparent" />
            {/* Bottom point shadow for triangle definition */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-black/20 blur-sm" />
            
            {/* Decorative corner elements on flap - More visible */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-stone-500/60" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-stone-500/60" />
            
            {/* Subtle decorative pattern on flap - More visible */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-stone-500/40" />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-stone-500/35" />
          </div>

          {/* Flap inner side (visible when open) */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-50 to-stone-100"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 98% 2%, 52% 98%, 50% 100%, 48% 98%, 2% 2%)",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-stone-100/30 to-transparent" />
          </div>
        </motion.div>

        {/* Wax Seal - Realistic smudged appearance with glow */}
        <AnimatePresence>
          {!sealBroken && (
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{
                scale: sealBroken ? [1, 1.2, 0] : 1,
                rotate: sealBroken ? [0, 15, -15, 0] : 0,
                opacity: sealBroken ? [1, 1, 0] : 1,
              }}
              transition={{ duration: 0.6 }}
              className="absolute left-1/2 -translate-x-1/2 z-30"
              style={{ bottom: "17%" }}
            >
              {/* Enhanced glowing aura around seal */}
              <motion.div
                className="absolute inset-0 -z-10"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute inset-0 bg-red-600/60 rounded-full blur-lg" />
                <div className="absolute inset-0 bg-red-500/50 rounded-full blur-xl" />
                <div className="absolute inset-0 bg-red-400/40 rounded-full blur-2xl" />
              </motion.div>

              {/* Seal Base - Smudged, not perfectly circular */}
              <motion.div
                className="relative w-14 h-14 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={breakSeal}
              >
                {/* Main seal body - irregular shape */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-800 to-red-900 shadow-2xl border-[3px] border-red-950/50"
                  style={{
                    borderRadius: "45% 55% 52% 48% / 48% 52% 48% 52%",
                    clipPath: "polygon(10% 0%, 90% 0%, 100% 20%, 95% 50%, 100% 80%, 90% 100%, 10% 100%, 0% 80%, 5% 50%, 0% 20%)",
                  }}
                >
                  {/* Seal texture and smudges */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-red-900/40 to-red-950/60" 
                    style={{
                      borderRadius: "45% 55% 52% 48% / 48% 52% 48% 52%",
                    }}
                  />
                  {/* Smudge marks */}
                  <div className="absolute top-2 left-3 w-2 h-2 bg-red-950/30 rounded-full blur-sm" />
                  <div className="absolute bottom-3 right-2 w-1.5 h-3 bg-red-950/40 rounded-full blur-sm rotate-12" />
                  <div className="absolute top-1/2 right-1 w-1.5 h-1.5 bg-red-950/30 rounded-full blur-sm" />
                  
                  {/* Text only */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-[7px] font-serif leading-tight text-center drop-shadow-md">
                      Always and Forever
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Click hint */}
              <motion.div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <p className="text-stone-400/80 text-xs font-serif italic">Click the seal to open</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seal Fragments (when broken) */}
        <AnimatePresence>
          {sealBroken && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`fragment-${i}`}
                  className="absolute left-1/2 w-4 h-4 bg-red-800 rounded-full z-30 shadow-lg"
                  style={{ bottom: "17%" }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 120,
                    y: (Math.random() - 0.5) * 120,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}