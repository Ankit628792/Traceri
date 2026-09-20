import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useArchive } from '../context/ArchiveContext';
import { ArchiveView } from '../components/ArchiveView';
import { Hero } from '../components/Hero';
import { EditorialBentoGrid } from '../components/EditorialBentoGrid';
import { EditorialPageTransition, editorialItemVariants } from '../components/EditorialPageTransition';

export const ArchivePage: React.FC = () => {
  const { archive, selectedReceipt, selectReceipt } = useArchive();
  const navigate = useNavigate();

  const handleExploreArchive = () => {
    const el = document.getElementById('editorial-bento-grid-section') || document.getElementById('archive-catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <EditorialPageTransition
      folio={{
        volume: 'VOL. 01',
        section: 'PRIMARY CATALOG & ARTIFACTS',
        edition: `${archive.totalTraces} TRACES RECORDED`,
      }}
    >
      {/* Editorial Cover Hero */}
      <motion.div variants={editorialItemVariants}>
        <Hero
          archive={archive}
          onExploreArchive={handleExploreArchive}
          onFollowThreads={() => navigate({ to: '/threads' })}
          onEnterStory={() => navigate({ to: '/story' })}
        />
      </motion.div>

      {/* Editorial Chromatic Bento Grid System */}
      <motion.div variants={editorialItemVariants}>
        <EditorialBentoGrid
          archive={archive}
          onSelectReceipt={selectReceipt}
          onExploreThreads={() => navigate({ to: '/threads' })}
        />
      </motion.div>

      {/* Primary Archival Field & Visualizer Section */}
      <motion.div variants={editorialItemVariants} id="archive-catalog-section">
        <ArchiveView
          archive={archive}
          selectedReceipt={selectedReceipt}
          onSelectReceipt={selectReceipt}
        />
      </motion.div>
    </EditorialPageTransition>
  );
};
