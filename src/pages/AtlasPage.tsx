import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useArchive } from '../context/ArchiveContext';
import { LifeMap } from '../components/LifeMap';
import { ThreeMemoryUniverse } from '../components/ThreeMemoryUniverse';
import { EditorialPageTransition, editorialItemVariants } from '../components/EditorialPageTransition';
import { MapPin, Boxes, Compass } from 'lucide-react';

export const AtlasPage: React.FC = () => {
  const { archive, selectReceipt } = useArchive();
  const [atlasMode, setAtlasMode] = useState<'map' | 'universe'>('map');

  return (
    <EditorialPageTransition
      folio={{
        volume: 'VOL. 01',
        section: 'SPATIAL & CELESTIAL ATLAS',
        edition: `${archive.placeCounts.length} UNIQUE LOCALES`,
      }}
      className="space-y-6"
    >
      {/* Sub-header with minimal perspective switcher */}
      <motion.div
        variants={editorialItemVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232730] pb-4"
      >
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#CFA04E] uppercase tracking-widest mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>SPATIAL & CELESTIAL PROJECTIONS</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#FAF8F5]">
            Memory Atlas
          </h1>
        </div>

        {/* Perspective Switcher */}
        <div className="flex items-center p-1 bg-[#12141C] border border-[#242934] rounded-xl self-start sm:self-auto">
          <button
            id="atlas-mode-map-btn"
            onClick={() => setAtlasMode('map')}
            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
              atlasMode === 'map'
                ? 'bg-[#FAF8F5] text-[#0A0B0D] font-bold shadow-md'
                : 'text-[#8E939E] hover:text-[#FAF8F5]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>2D GEOGRAPHIC MAP</span>
          </button>

          <button
            id="atlas-mode-universe-btn"
            onClick={() => setAtlasMode('universe')}
            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
              atlasMode === 'universe'
                ? 'bg-[#FAF8F5] text-[#0A0B0D] font-bold shadow-md'
                : 'text-[#8E939E] hover:text-[#FAF8F5]'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>3D CONSTELLATION</span>
          </button>
        </div>
      </motion.div>

      {/* Render selected spatial view */}
      <motion.div variants={editorialItemVariants}>
        {atlasMode === 'map' ? (
          <LifeMap archive={archive} onSelectReceipt={selectReceipt} />
        ) : (
          <ThreeMemoryUniverse archive={archive} onSelectReceipt={selectReceipt} />
        )}
      </motion.div>
    </EditorialPageTransition>
  );
};
