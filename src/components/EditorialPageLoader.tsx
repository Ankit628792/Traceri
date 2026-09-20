import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TraceriLogo } from './TraceriLogo';
import { APP_INFO } from '../data/common';

interface EditorialPageLoaderProps {
  isLoading: boolean;
  type?: 'initial' | 'route';
  routePath?: string;
  onComplete?: () => void;
}

const APP_NAME_LETTERS = APP_INFO.letters;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: 'blur(8px)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay: 0.38,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const EditorialPageLoader: React.FC<EditorialPageLoaderProps> = ({
  isLoading,
  onComplete,
}) => {
  useEffect(() => {
    if (!isLoading) return;
    const duration = 900;
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [isLoading, onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="minimal-app-loader"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0B0D] text-[#E4E1DB] select-none overflow-hidden"
        >
          {/* Ambient Subtle Gold Glow */}
          <div className="absolute w-[400px] h-[400px] bg-[#CFA04E]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Minimal Centered App Branding Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            
            {/* Logo Mark with Soft Entrance */}
            <motion.div variants={letterVariants} className="mb-6">
              <div className="p-3 rounded-2xl bg-[#13161C] border border-[#252B38] shadow-xl">
                <TraceriLogo className="w-10 h-10" />
              </div>
            </motion.div>

            {/* Staggered App Name Letters */}
            <div className="flex items-center space-x-1 sm:space-x-2 font-editorial text-5xl sm:text-7xl font-light tracking-wider text-[#FAF8F5]">
              {APP_NAME_LETTERS.map((letter, idx) => (
                <motion.span
                  key={idx}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Subtle Minimal Subtitle Tag */}
            <motion.p
              variants={subtitleVariants}
              className="mt-3 text-[11px] font-mono uppercase tracking-[0.35em] text-[#CFA04E]"
            >
              {APP_INFO.subtitle}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
