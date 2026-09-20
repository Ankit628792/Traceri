import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ProcessedArchive, LifeReceipt } from '../types';
import {
  Compass,
  Film,
  Music,
  Coffee,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowUpRight,
  MapPin,
  Search,
  Layers,
  Radio,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface EditorialBentoGridProps {
  archive: ProcessedArchive;
  onSelectReceipt: (receipt: LifeReceipt) => void;
  onExploreThreads?: () => void;
}

const bentoCellVariants = {
  hidden: { opacity: 0, y: 28, rotateY: -12, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.52,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export const EditorialBentoGrid: React.FC<EditorialBentoGridProps> = React.memo(({
  archive,
  onSelectReceipt,
}) => {
  // Find interesting receipts from archive to feature in bento cells (memoized)
  const { noteReceipt, musicReceipt, movieReceipt, purchaseReceipt, searchReceipt, featuredThread } = useMemo(() => {
    const note = archive.receipts.find((r) => r.type === 'notes') || archive.receipts[0];
    const music = archive.receipts.find((r) => r.type === 'music');
    const movie = archive.receipts.find((r) => r.type === 'movies');
    const purchase = archive.receipts.find(
      (r) => r.type === 'purchases' && (r.title.toLowerCase().includes('coffee') || r.title.toLowerCase().includes('roast') || r.title.toLowerCase().includes('cafe'))
    ) || archive.receipts.find((r) => r.type === 'purchases');
    const search = archive.receipts.find((r) => r.type === 'searches');
    const thread = archive.threads[0];

    return {
      noteReceipt: note,
      musicReceipt: music,
      movieReceipt: movie,
      purchaseReceipt: purchase,
      searchReceipt: search,
      featuredThread: thread,
    };
  }, [archive]);

  return (
    <section
      id="editorial-bento-grid-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      aria-label="Editorial Bento Grid Showcase"
    >
      {/* Editorial Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-[#242A38] pb-6 gap-4"
      >
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-[0.25em] text-[#E5A93C] uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>DISPATCH N° 01 · CURATED BENTO MATRIX</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-normal text-[#FAF8F5] tracking-tight">
            The Archival Chronicle
          </h2>
          <p className="mt-2 text-sm text-[#9CA3AF] max-w-xl font-sans">
            A tactile synthesis of audio frequencies, caffeine extractions, celluloid memories,
            and wanderer coordinates—rendered in vibrant chromatic chambers.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-[#6B7280]">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#FAF8F5]">SYNCHRONIZED GRAPH</span>
          </span>
          <span>·</span>
          <span>{archive.totalTraces} MEMORY VECTORS</span>
        </div>
      </motion.div>

      {/* BENTO GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)]" style={{ perspective: 1200 }}>

        {/* =========================================================================
            BENTO CELL 1: THE MONOGRAPH / ESSAY COVER (Spans 2 cols, 2 rows)
            Color Theme: Royal Violet & Amber Gold
           ========================================================================= */}
        <motion.div
          id="bento-cell-monograph"
          data-cursor-label="READ"
          onClick={() => noteReceipt && onSelectReceipt(noteReceipt)}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={bentoCellVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="md:col-span-2 lg:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#1C1433] via-[#10121D] to-[#0A0C13] border border-[#3E2D69]/60 hover:border-[#E5A93C]/70 transition-all duration-200 ease-out shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#8B5CF6]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-[#D97706]/10 blur-2xl pointer-events-none" />

          {/* Top Bar inside Card */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/40 flex items-center space-x-1.5">
                <BookOpen className="w-3 h-3 text-[#C4B5FD]" />
                <span>ESSAY DISPATCH</span>
              </span>
              <span className="text-[11px] font-mono text-[#9CA3AF]">
                {noteReceipt ? new Date(noteReceipt.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'ARCHIVE ENTRY'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5]/5 flex items-center justify-center text-[#9CA3AF] group-hover:text-[#E5A93C] group-hover:bg-[#E5A93C]/10 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Core Pullquote Content */}
          <div className="relative z-10 my-6">
            <div className="font-editorial text-4xl text-[#E5A93C]/30 leading-none mb-1 select-none">
              “
            </div>
            <p className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-[#FAF8F5] leading-snug tracking-tight font-normal">
              {noteReceipt?.metadata?.quote || noteReceipt?.description || noteReceipt?.title || 'The city reveals itself in quiet corners where morning light cuts through steam.'}
            </p>
            <p className="mt-4 font-sans text-xs sm:text-sm text-[#A5ADC0] max-w-md leading-relaxed">
              Preserved verbatim from the personal ledger. Cross-referenced with nocturnal walking trajectories and temporal indices.
            </p>
          </div>

          {/* Bottom Card Footer */}
          <div className="relative z-10 pt-4 border-t border-[#292D3E] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#D1D5DB]">
              <span className="text-[#E5A93C] font-semibold">TRACE REF:</span>
              <span className="text-white">{noteReceipt?.id || 'T-001'}</span>
              <span className="text-[#6B7280]">·</span>
              <span className="text-[#9CA3AF] truncate max-w-[160px] sm:max-w-xs">{noteReceipt?.title}</span>
            </div>
            <span className="text-[11px] font-mono text-[#E5A93C] group-hover:underline flex items-center space-x-1">
              <span>INSPECT RECORD</span>
              <span>→</span>
            </span>
          </div>
        </motion.div>

        {/* =========================================================================
            BENTO CELL 2: SONIC FOOTPRINT & VINYL CHRONICLE (1 col)
            Color Theme: Vibrant Deep Indigo & Electric Purple
           ========================================================================= */}
        <motion.div
          id="bento-cell-music"
          data-cursor-label="LISTEN"
          onClick={() => musicReceipt && onSelectReceipt(musicReceipt)}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={bentoCellVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#1E163B] via-[#111122] to-[#0A0B14] border border-[#4F46E5]/40 hover:border-[#818CF8]/70 transition-all duration-200 ease-out shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#6366F1]/20 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/40 flex items-center space-x-1">
              <Music className="w-3 h-3 text-[#818CF8]" />
              <span>SONIC TRACE</span>
            </span>
            <span className="text-[10px] font-mono text-[#818CF8] flex items-center space-x-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>33⅓ RPM</span>
            </span>
          </div>

          {/* Vinyl Art & Equalizer Representation */}
          <div className="my-4">
            <div className="flex items-center space-x-4 mb-3">
              {/* Stylized Vinyl Disc Mockup */}
              <div className="relative w-14 h-14 rounded-full bg-[#171923] border-2 border-[#2E3448] flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#EC4899] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0A0B14]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono uppercase tracking-wider text-[#818CF8] truncate">
                  {musicReceipt?.metadata?.artist || 'MILES DAVIS'}
                </div>
                <div className="font-editorial text-lg text-[#FAF8F5] truncate leading-snug">
                  {musicReceipt?.title || 'Kind of Blue'}
                </div>
                <div className="text-[11px] font-mono text-[#9CA3AF] truncate">
                  {musicReceipt?.metadata?.album || 'Columbia Masterworks'}
                </div>
              </div>
            </div>

            {/* Audio Waveform Bars */}
            <div className="h-6 flex items-end space-x-1 px-1 bg-[#0E101D] rounded-lg border border-[#252A42] py-1">
              {[40, 75, 55, 90, 65, 80, 45, 95, 70, 85, 60, 100, 50, 75, 90, 60].map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-[#6366F1] to-[#A5B4FC] rounded-xs"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#A5B4FC]">
            <span>{musicReceipt?.metadata?.duration || '05:32 MIN'}</span>
            <span className="flex items-center space-x-1 group-hover:underline">
              <span>PLAYBACK LOG</span>
              <span>→</span>
            </span>
          </div>
        </motion.div>

        {/* =========================================================================
            BENTO CELL 3: THE CAFFEINE LEDGER (1 col)
            Color Theme: Radiant Terracotta & Burnt Copper
           ========================================================================= */}
        <motion.div
          id="bento-cell-coffee"
          data-cursor-label="ORDER"
          onClick={() => purchaseReceipt && onSelectReceipt(purchaseReceipt)}
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={bentoCellVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#2D160C] via-[#140E0B] to-[#0D0A0A] border border-[#EA580C]/40 hover:border-[#F97316]/70 transition-all duration-200 ease-out shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#EA580C]/20 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#EA580C]/20 text-[#FDBA74] border border-[#EA580C]/40 flex items-center space-x-1">
              <Coffee className="w-3 h-3 text-[#FB923C]" />
              <span>ROAST EXTRACTION</span>
            </span>
            <span className="text-[10px] font-mono text-[#FB923C] font-bold">
              {purchaseReceipt?.metadata?.amount ? `$${Number(purchaseReceipt.metadata.amount).toFixed(2)}` : '¥850'}
            </span>
          </div>

          {/* Tactile Receipt Stub Content */}
          <div className="my-3 font-mono">
            <div className="font-editorial text-xl text-[#FAF8F5] leading-snug">
              {purchaseReceipt?.title || 'Ethiopian Heirloom V60'}
            </div>
            <div className="mt-1 text-xs text-[#FDBA74] flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-[#EA580C]" />
              <span className="truncate">{purchaseReceipt?.subtitle || 'Blue Bottle · Aoyama Tokyo'}</span>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-[#19110B] border border-[#3A1F13] text-[10px] text-[#D1D5DB] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">RATIO:</span>
                <span className="text-[#FDBA74]">1:15.5 @ 94°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">FLAVOR:</span>
                <span className="text-[#FAF8F5] truncate ml-1">Jasmine · Bergamot · Peach</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#FDBA74]">
            <span className="text-[#9CA3AF]">PHYSICAL STUB</span>
            <span className="flex items-center space-x-1 group-hover:underline">
              <span>VIEW INVOICE</span>
              <span>→</span>
            </span>
          </div>
        </motion.div>

        {/* =========================================================================
            BENTO CELL 4: THE NOCTURNAL CINEMA REEL (1 col)
            Color Theme: Rich Crimson Wine & Ruby Velvet
           ========================================================================= */}
        <motion.div
          id="bento-cell-cinema"
          data-cursor-label="WATCH"
          onClick={() => movieReceipt && onSelectReceipt(movieReceipt)}
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={bentoCellVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#2F0F18] via-[#140B0F] to-[#0A0709] border border-[#E11D48]/40 hover:border-[#FB7185]/70 transition-all duration-200 ease-out shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[#E11D48]/20 blur-2xl pointer-events-none" />

          {/* 35mm Sprocket Holes Header */}
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#E11D48]/20 text-[#FDA4AF] border border-[#E11D48]/40 flex items-center space-x-1">
              <Film className="w-3 h-3 text-[#FB7185]" />
              <span>35MM ARCHIVE</span>
            </span>
            <span className="text-[10px] font-mono text-[#FB7185]">
              {movieReceipt?.metadata?.year || '2000'}
            </span>
          </div>

          {/* Cinema Frame Details */}
          <div className="my-3">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#FDA4AF]">
              DIRECTED BY {movieReceipt?.metadata?.director?.toUpperCase() || 'WONG KAR-WAI'}
            </div>
            <div className="font-editorial text-xl sm:text-2xl text-[#FAF8F5] leading-tight my-1">
              {movieReceipt?.title || 'In the Mood for Love'}
            </div>
            <p className="text-xs text-[#D1D5DB] font-sans line-clamp-2 mt-1">
              {movieReceipt?.description || movieReceipt?.metadata?.note || 'Drenched in rain and cello melodies. Time flowing backwards in Hong Kong alleyways.'}
            </p>
          </div>

          {/* Footer with Film Perforations */}
          <div className="pt-2 border-t border-[#3D1923] flex items-center justify-between text-[11px] font-mono text-[#FDA4AF]">
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map((s) => (
                <div key={s} className="w-1.5 h-2 rounded-xs bg-[#FB7185]/40" />
              ))}
            </div>
            <span className="flex items-center space-x-1 group-hover:underline">
              <span>CINEMA DOSSIER</span>
              <span>→</span>
            </span>
          </div>
        </motion.div>

        {/* =========================================================================
            BENTO CELL 5: WANDERER'S ATLAS & GEOLOCATION (2 cols on lg)
            Color Theme: Lush Emerald & Jade Green
           ========================================================================= */}
        <motion.div
          id="bento-cell-atlas"
          data-cursor-label="NAVIGATE"
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={bentoCellVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-[#0F2B20] via-[#0C1613] to-[#080E0C] border border-[#10B981]/40 hover:border-[#34D399]/70 transition-all duration-200 ease-out shadow-sm hover:shadow-xl flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#6EE7B7] border border-[#10B981]/40 flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-[#34D399]" />
                <span>SPATIAL CARTOGRAPHY</span>
              </span>
              <span className="text-[11px] font-mono text-[#A7F3D0]">
                {archive.placeCounts.length} GLOBAL NODES
              </span>
            </div>

            <Link
              to="/atlas"
              className="text-xs font-mono text-[#34D399] hover:text-white flex items-center space-x-1"
            >
              <span>OPEN FULL ATLAS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Visual Coordinates Matrix */}
          <div className="my-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {archive.placeCounts.slice(0, 3).map((place, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const r = archive.receipts.find((rec) => rec.subtitle?.includes(place.name) || rec.title.includes(place.name));
                  if (r) onSelectReceipt(r);
                }}
                className="p-3 rounded-xl bg-[#091D16]/80 border border-[#173F30] hover:border-[#34D399]/70 transition-colors cursor-pointer group/node"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#6EE7B7] mb-1">
                  <span>ZONE 0{idx + 1}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#10B981]/30 text-white font-bold">{place.count} TRACES</span>
                </div>
                <div className="font-editorial text-base text-[#FAF8F5] truncate group-hover/node:text-[#34D399] transition-colors">
                  {place.name}
                </div>
                <div className="mt-1 text-[10px] font-mono text-[#9CA3AF] flex items-center space-x-1">
                  <MapPin className="w-2.5 h-2.5 text-[#10B981]" />
                  <span>35.6° N, 139.7° E</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Bar */}
          <div className="pt-3 border-t border-[#16382C] flex items-center justify-between text-xs font-mono text-[#A7F3D0]">
            <span>GEODETIC DISPLACEMENT: 14,280 KM LOGGED</span>
            <Link to="/atlas" className="text-[#34D399] hover:underline flex items-center space-x-1">
              <span>EXPLORE INTERACTIVE GLOBE</span>
              <span>→</span>
            </Link>
          </div>
        </motion.div>

        {/* =========================================================================
            BENTO CELL 6: SEARCH CURIOSITY STREAM (1 col)
            Color Theme: Luminous Cyan & Aquamarine
           ========================================================================= */}
        <motion.div
          id="bento-cell-search"
          data-cursor-label="SEARCH"
          onClick={() => searchReceipt && onSelectReceipt(searchReceipt)}
          custom={5}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={bentoCellVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#0B252C] via-[#09161B] to-[#060D10] border border-[#06B6D4]/40 hover:border-[#22D3EE]/70 transition-all duration-200 ease-out shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[#06B6D4]/20 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#06B6D4]/20 text-[#67E8F9] border border-[#06B6D4]/40 flex items-center space-x-1">
              <Search className="w-3 h-3 text-[#22D3EE]" />
              <span>DIGITAL INQUIRY</span>
            </span>
            <span className="text-[10px] font-mono text-[#67E8F9]">QUERY STREAM</span>
          </div>

          {/* Query Terminal Representation */}
          <div className="my-3 font-mono">
            <div className="text-[11px] text-[#67E8F9] mb-1">
              $ query --latest
            </div>
            <div className="font-editorial text-lg text-[#FAF8F5] leading-snug">
              “{searchReceipt?.title || 'why do rain smells evoke memory so intensely'}”
            </div>
            <div className="mt-2 text-[10px] text-[#A5F3FC]/70 line-clamp-2">
              Cross-indexed with cognitive psychology journals, olfactory neurobiology, and sensory recall.
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#67E8F9]">
            <span>SERP CACHE</span>
            <span className="flex items-center space-x-1 group-hover:underline">
              <span>EXPLORE QUERY</span>
              <span>→</span>
            </span>
          </div>
        </motion.div>

        {/* =========================================================================
            BENTO CELL 7: TEMPORAL LIFE CALENDAR SHORTCUT (1 col)
            Color Theme: Radiant Luminous Gold & Amber Sun
           ========================================================================= */}
        <motion.div
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={bentoCellVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          className="rounded-2xl overflow-hidden"
        >
          <Link
            to="/calendar"
            id="bento-cell-calendar"
            data-cursor-label="CALENDAR"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#33230B] via-[#171107] to-[#0D0A04] border border-[#F59E0B]/50 hover:border-[#FBBF24]/70 transition-all duration-200 ease-out shadow-sm hover:shadow-xl flex flex-col justify-between h-full block"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-[#F59E0B]/25 blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#F59E0B]/20 text-[#FDE68A] border border-[#F59E0B]/40 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#FBBF24]" />
                <span>TEMPORAL DENSITY</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-ping" />
            </div>

            {/* Mini Calendar Density Grid Preview */}
            <div className="my-3">
              <div className="text-xs font-mono text-[#FDE68A] uppercase tracking-wider mb-2">
                ACTIVE FOOTPRINT
              </div>
              {/* 7-column mini density grid representing days */}
              <div className="grid grid-cols-7 gap-1.5 p-2 rounded-lg bg-[#1C1407] border border-[#44300E]">
                {[1, 0, 3, 2, 5, 4, 1, 0, 2, 6, 3, 1, 4, 2, 0, 1, 5, 3, 2, 4, 1].map((level, i) => (
                  <div
                    key={i}
                    className={`w-full aspect-square rounded-xs transition-colors ${
                      level === 0
                        ? 'bg-[#2A2012]'
                        : level === 1
                        ? 'bg-[#664612]'
                        : level <= 3
                        ? 'bg-[#B47818]'
                        : 'bg-[#FBBF24] shadow-[0_0_6px_#FBBF24]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#FDE68A]">
              <span className="text-[#D97706] font-bold">LIFE CALENDAR</span>
              <span className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>VIEW MATRIX</span>
                <span>→</span>
              </span>
            </div>
          </Link>
        </motion.div>

      </div>

      {/* Featured Thread Ribbon Banner */}
      {featuredThread && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-6 p-4 sm:p-5 rounded-xl bg-[#12151F] border border-[#272D3E] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#E5A93C]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#E5A93C] uppercase tracking-widest">
                ACTIVE NARRATIVE THREAD
              </div>
              <div className="font-editorial text-base sm:text-lg text-[#FAF8F5]">
                {featuredThread.title}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono text-[#9CA3AF]">
              {featuredThread.receiptIds.length} CONNECTED ARTIFACTS
            </span>
            <Link
              to="/threads"
              search={{ threadId: featuredThread.id }}
              className="px-3.5 py-1.5 rounded-lg bg-[#FAF8F5] text-[#0A0B0D] font-mono text-xs font-semibold hover:bg-[#E5A93C] transition-colors"
            >
              FOLLOW THREAD →
            </Link>
          </div>
        </motion.div>
      )}

    </section>
  );
});
