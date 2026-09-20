import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { EditorialPageTransition, editorialItemVariants } from '../components/EditorialPageTransition';
import { APP_INFO } from '../data/common';

export const NotFoundPage: React.FC = () => {
  return (
    <EditorialPageTransition
      folio={{
        volume: APP_INFO.volume,
        section: '404 · NOT FOUND',
        edition: APP_INFO.edition,
      }}
      className="min-h-[65vh] flex flex-col items-center justify-center py-16 px-4 sm:px-6 text-center"
    >
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Subtle Number */}
        <motion.div
          variants={editorialItemVariants}
          className="font-editorial text-7xl sm:text-8xl font-bold tracking-tight text-[#FAF8F5]/10 select-none mb-2"
        >
          404
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={editorialItemVariants}
          className="font-editorial text-3xl sm:text-4xl text-[#FAF8F5] tracking-tight font-medium mb-3"
        >
          Page Not Found
        </motion.h1>

        {/* 1 Line Description */}
        <motion.p
          variants={editorialItemVariants}
          className="text-sm font-sans text-[#8E939E] leading-normal mb-8 max-w-sm"
        >
          The coordinate you requested does not exist or has been relocated.
        </motion.p>

        {/* Action Button */}
        <motion.div variants={editorialItemVariants}>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#CFA04E] hover:bg-[#E5B660] text-[#0A0B0D] font-mono font-medium text-xs tracking-wider uppercase transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Archive</span>
          </Link>
        </motion.div>
      </div>
    </EditorialPageTransition>
  );
};
