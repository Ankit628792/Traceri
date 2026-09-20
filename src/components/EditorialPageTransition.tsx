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
  className = '',
}) => {
  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};
