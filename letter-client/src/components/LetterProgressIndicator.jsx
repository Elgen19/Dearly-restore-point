// LetterProgressIndicator.jsx - Progress indicator for letter crafting sections
import React from "react";
import { motion } from "framer-motion";

export default function LetterProgressIndicator({ 
  currentSection, 
  sections = [
    { id: 'introductory', label: 'Introduction', icon: '✨' },
    { id: 'mainBody', label: 'Main Letter', icon: '✍️' },
    { id: 'closing', label: 'Final Message', icon: '💝' }
  ],
  onSectionClick
}) {
  const getSectionIndex = (sectionId) => {
    return sections.findIndex(s => s.id === sectionId);
  };

  const currentIndex = getSectionIndex(currentSection);
  // When in preview, treat as if all sections are completed
  const isPreview = currentSection === 'preview';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto mb-4"
    >
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 -z-10" />
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 -z-10"
          initial={{ width: 0 }}
          animate={{ 
            width: isPreview 
              ? '100%' 
              : currentIndex >= 0 
                ? `${(currentIndex / (sections.length - 1)) * 100}%` 
                : '0%' 
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Section Indicators */}
        {sections.map((section, index) => {
          const isActive = section.id === currentSection;
          const isCompleted = isPreview || currentIndex > index;
          const isClickable = onSectionClick && !isPreview && (isCompleted || isActive);

          return (
            <motion.div
              key={section.id}
              className="flex flex-col items-center flex-1 cursor-pointer"
              onClick={isClickable ? () => onSectionClick(section.id) : undefined}
              whileHover={isClickable ? { scale: 1.1 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
            >
              {/* Icon Circle */}
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/50 scale-110'
                    : isCompleted
                    ? 'bg-white/20 backdrop-blur-sm border border-white/30'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20'
                }`}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {section.icon}
              </motion.div>

              {/* Label */}
              <motion.p
                className={`text-[10px] font-serif text-center transition-all ${
                  isActive
                    ? 'text-white font-semibold'
                    : isCompleted
                    ? 'text-white/70'
                    : 'text-white/50'
                }`}
                animate={{
                  opacity: isActive ? 1 : isCompleted ? 0.7 : 0.5,
                }}
              >
                {section.label}
              </motion.p>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 w-1.5 h-1.5 bg-pink-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

