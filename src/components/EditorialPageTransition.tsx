import React from 'react';
import { motion, Variants } from 'motion/react';

interface EditorialPageTransitionProps {
  children: React.ReactNode;
  folio?: {
    volume?: string;
    section?: string;
    edition?: string;
  };
  className?: string;
}

const editorialEasing = [0.16, 1, 0.3, 1] as const;

// Editorial magazine entrance animation variants
export const pageContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      ease: editorialEasing,
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

export const editorialItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: editorialEasing,
    },
  },
};

export const EditorialPageTransition: React.FC<EditorialPageTransitionProps> = ({
  children,
  folio,
  className = '',
}) => {
  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full ${className}`}
    >
      {/* Editorial Folio Tag (Magazine header line) if provided */}
      {folio && (
        <motion.div
          variants={editorialItemVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between text-[10px] font-mono text-[#8E939E] border-b border-[#232730]/60 mb-4 select-none"
        >
          <div className="flex items-center space-x-3">
            <span className="text-[#CFA04E] font-semibold tracking-wider">
              {folio.volume || 'VOL. 01'}
            </span>
            <span>·</span>
            <span className="uppercase tracking-widest text-[#FAF8F5]">
              {folio.section || 'ARCHIVE'}
            </span>
          </div>
          <div className="flex items-center space-x-4 tracking-wider">
            <span>{folio.edition || 'DIGITAL TRACES EDITION'}</span>
          </div>
        </motion.div>
      )}

      {children}
    </motion.div>
  );
};
