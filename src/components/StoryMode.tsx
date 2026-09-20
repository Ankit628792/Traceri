import React, { useState, useEffect, useRef } from 'react';
import { ProcessedArchive, LifeChapter, LifeReceipt } from '../types';
import { ReceiptItem } from './ReceiptItem';
import {
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface StoryModeProps {
  archive: ProcessedArchive;
  onSelectReceipt: (receipt: LifeReceipt) => void;
  onFollowThread: (startReceiptId: string) => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({
  archive,
  onSelectReceipt,
  onFollowThread,
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [activeEvidenceReceiptId, setActiveEvidenceReceiptId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'continuous' | 'single'>('continuous');

  const containerRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  // Track overall scroll progress for top reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = window.scrollY || el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        setReadingProgress(Math.round(progress));
      }

      // Scroll-spy to detect which chapter is currently in view
      if (viewMode === 'continuous') {
        chapterRefs.current.forEach((ref, idx) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            if (rect.top <= 260 && rect.bottom >= 260) {
              setActiveChapterIndex(idx);
            }
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const scrollToChapter = (idx: number) => {
    setActiveChapterIndex(idx);
    if (viewMode === 'continuous') {
      const target = chapterRefs.current[idx];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentChapter = archive.chapters[activeChapterIndex] || archive.chapters[0];

  // Get receipts for chapter
  const getChapterReceipts = (ch: LifeChapter): LifeReceipt[] => {
    return ch.receiptIds
      .map((id) => archive.receipts.find((r) => r.id === id))
      .filter((r): r is LifeReceipt => Boolean(r));
  };

  return (
    <div ref={containerRef} className="min-h-screen text-[#FAF8F5] pb-32">
      {/* 1. TOP STICKY EDITORIAL READING BAR & PROGRESS */}
      <header className="sticky top-0 z-40 bg-[#07080A]/90 backdrop-blur-md border-b border-[#232730] px-4 sm:px-8 py-3 transition-all">
        {/* Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1B1E26]">
          <div
            className="h-full bg-gradient-to-r from-[#CFA04E] to-[#FAF8F5] transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-3 truncate">
            <span className="px-2 py-0.5 rounded bg-[#CFA04E]/15 text-[#CFA04E] font-bold tracking-wider">
              LONG-FORM EDITORIAL
            </span>
            <span className="hidden md:inline text-[#8E939E]">·</span>
            <span className="hidden md:inline text-[#E4E1DB] truncate">
              {currentChapter ? `CHAPTER ${currentChapter.number}: ${currentChapter.title}` : 'ARCHIVAL MONOGRAPH'}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#13161C] border border-[#2B313E] rounded-lg p-0.5">
              <button
                id="story-mode-continuous-btn"
                onClick={() => setViewMode('continuous')}
                className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                  viewMode === 'continuous'
                    ? 'bg-[#FAF8F5] text-[#07080A] font-bold'
                    : 'text-[#8E939E] hover:text-[#FAF8F5]'
                }`}
                title="Continuous scroll-driven article flow"
              >
                Article Flow
              </button>
              <button
                id="story-mode-single-btn"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                  viewMode === 'single'
                    ? 'bg-[#FAF8F5] text-[#07080A] font-bold'
                    : 'text-[#8E939E] hover:text-[#FAF8F5]'
                }`}
                title="Chapter-by-chapter reader"
              >
                Chapter View
              </button>
            </div>

            {/* Reading progress badge */}
            <span className="text-[#8E939E] font-mono text-[11px] pl-1">
              {readingProgress}% READ
            </span>
          </div>
        </div>
      </header>

      {/* 2. CINEMATIC ARTICLE COVER / MASTHEAD */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 border-b border-[#232730]">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#161922] border border-[#2A3242] text-[11px] font-mono text-[#CFA04E] tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            <span>CRITICAL ESSAY · VOLUME 01 · EMPIRICAL TRACES</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-light text-[#FAF8F5] leading-[1.1] tracking-tight max-w-4xl mx-auto">
            The Geometry of Memory: An Empirical Life Archive
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#9CA3AF] max-w-2xl mx-auto font-light leading-relaxed">
            A forensic reconstruction of 45 physical receipts, spatial recurrences, and celluloid echoes across London, Tokyo, and Kyoto.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#8E939E] pt-4">
            <span className="text-[#E4E1DB]">BY RELATIONAL ENGINE</span>
            <span>·</span>
            <span>NOVEMBER 2024 — APRIL 2025</span>
            <span>·</span>
            <span>{archive.receipts.length} DOCUMENTED TRACES</span>
            <span>·</span>
            <span>12 MINUTE READ</span>
          </div>
        </div>

        {/* Hero Archival Graphic */}
        {archive.chapters[0]?.graphicUrl && (
          <div className="mt-12 rounded-2xl overflow-hidden border border-[#2B313E] shadow-2xl relative group bg-[#0D0F14]">
            <div className="aspect-[16/9] w-full relative overflow-hidden">
              <img
                src={archive.chapters[0].graphicUrl}
                alt="Solaris Retrospective Barbican"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale-[15%] contrast-[110%] group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-transparent to-black/20" />
            </div>

            {/* Archival Figure Caption */}
            <div className="p-4 sm:p-6 bg-[#0B0D12] border-t border-[#232730] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#8E939E]">
              <div>
                <span className="text-[#CFA04E] font-bold mr-2">FIG 1.0</span>
                <span className="text-[#FAF8F5]">Andrei Tarkovsky’s Solaris (1972)</span>
                <span className="text-[#6B7280] ml-2">— 35mm archival print unspooled at Barbican Cinema 1.</span>
              </div>
              <span className="text-[#6B7280]">ARCHIVAL SPECIMEN #001</span>
            </div>
          </div>
        )}

        {/* Editorial Abstract Callout */}
        <div className="mt-12 p-6 rounded-xl bg-[#0F1218] border border-[#232A38] text-sm text-[#C9BFB5] font-serif leading-relaxed max-w-3xl mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#CFA04E] mb-2 font-sans font-semibold">
            METHODOLOGY NOTE
          </div>
          Every statement, paragraph, and pattern in this narrative is grounded strictly in concrete digital traces: transaction records, geotags, time intervals, and recorded media acquisitions. No machine-learning hallucinations are permitted; narrative emerges exclusively from relational evidence.
        </div>

        {/* Chapter Jump Directory */}
        <div className="mt-12 pt-8 border-t border-[#232730]">
          <div className="text-center font-mono text-xs uppercase tracking-widest text-[#8E939E] mb-4">
            CHAPTER INDEX
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {archive.chapters.map((ch, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <button
                  key={ch.id}
                  id={`article-index-${ch.id}`}
                  onClick={() => scrollToChapter(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all group ${
                    isActive
                      ? 'bg-[#1A1F2B] border-[#CFA04E] shadow-md'
                      : 'bg-[#0E1015] border-[#202530] hover:border-[#353D4D] hover:bg-[#141720]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className={isActive ? 'text-[#CFA04E] font-bold' : 'text-[#8E939E]'}>
                      CHAPTER {ch.number}
                    </span>
                    <span className="text-[10px] text-[#6B7280]">{ch.receiptCount} Traces</span>
                  </div>
                  <div className="font-editorial text-sm text-[#FAF8F5] group-hover:text-[#CFA04E] transition-colors truncate">
                    {ch.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. SCROLL-DRIVEN CHAPTER SECTIONS */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-32">
        {archive.chapters
          .filter((_, idx) => viewMode === 'continuous' || idx === activeChapterIndex)
          .map((chapter) => {
            const chapterReceipts = getChapterReceipts(chapter);
            const globalChapterIndex = archive.chapters.findIndex((c) => c.id === chapter.id);

            return (
              <article
                key={chapter.id}
                id={`chapter-${chapter.id}`}
                ref={(el) => {
                  chapterRefs.current[globalChapterIndex] = el;
                }}
                className="space-y-16 scroll-mt-24"
              >
                {/* Chapter Section Header */}
                <header className="border-b border-[#232730] pb-10 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8E939E]">
                    <span className="text-[#CFA04E] tracking-widest uppercase font-bold">
                      ACT {chapter.number} OF 0{archive.chapters.length}
                    </span>
                    <span>
                      {new Date(chapter.period.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' — '}
                      {new Date(chapter.period.end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h2 className="font-editorial text-4xl sm:text-6xl font-light text-[#FAF8F5] tracking-tight">
                    {chapter.title}
                  </h2>

                  <p className="font-serif italic text-base sm:text-lg text-[#9CA3AF] max-w-2xl leading-relaxed">
                    {chapter.subtitle}
                  </p>
                </header>

                {/* Chapter Lead Graphic with Editorial Annotation */}
                {chapter.graphicUrl && (
                  <div className="rounded-2xl overflow-hidden border border-[#2B313E] shadow-xl bg-[#0D0F14]">
                    <div className="aspect-[16/9] w-full relative overflow-hidden">
                      <img
                        src={chapter.graphicUrl}
                        alt={chapter.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover contrast-[105%] group-hover:scale-[1.01] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07080A]/90 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                        <div className="font-editorial text-lg sm:text-2xl text-[#FAF8F5] drop-shadow-md">
                          “{chapter.pullQuote}”
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Editorial Lead Prose */}
                {chapter.editorialLead && (
                  <div className="relative pl-6 sm:pl-8 border-l-2 border-[#CFA04E]/60 py-2">
                    <p className="font-serif text-lg sm:text-xl text-[#FAF8F5] leading-relaxed font-light">
                      {chapter.editorialLead}
                    </p>
                  </div>
                )}

                {/* SCROLL-DRIVEN NARRATIVE SECTIONS WITH VISUAL EVIDENCE */}
                <div className="space-y-20">
                  {chapter.narrativeParagraphs?.map((narrative, nIdx) => {
                    const evidenceReceipts = narrative.evidenceReceiptIds
                      .map((id) => archive.receipts.find((r) => r.id === id))
                      .filter((r): r is LifeReceipt => Boolean(r));

                    return (
                      <section
                        key={nIdx}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-[#1C2028]"
                      >
                        {/* Left Column: Narrative Prose & Discovered Pattern */}
                        <div className="lg:col-span-7 space-y-6">
                          <div className="font-mono text-xs text-[#CFA04E] tracking-wider uppercase">
                            {narrative.heading}
                          </div>

                          <p className="font-serif text-base sm:text-lg text-[#D1C7BD] leading-relaxed font-light">
                            {narrative.body}
                          </p>

                          {/* Discovered Relational Pattern Box */}
                          {narrative.discoveredPattern && (
                            <div className="p-4 rounded-xl bg-[#12151C] border border-[#262D3D] space-y-2 shadow-sm">
                              <div className="flex items-center space-x-2 text-xs font-mono text-[#569CA6]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#569CA6]" />
                                <span className="font-bold uppercase tracking-wider">
                                  DISCOVERED PATTERN
                                </span>
                              </div>
                              <p className="font-sans text-xs text-[#E4E1DB] leading-relaxed">
                                {narrative.discoveredPattern}
                              </p>
                            </div>
                          )}

                          {/* Interconnected Threads Action */}
                          <div className="pt-2">
                            <button
                              id={`thread-trigger-${chapter.id}-${nIdx}`}
                              onClick={() => {
                                if (evidenceReceipts[0]) {
                                  onFollowThread(evidenceReceipts[0].id);
                                }
                              }}
                              className="inline-flex items-center space-x-2 text-xs font-mono text-[#CFA04E] hover:text-[#E9BD6F] transition-colors group"
                            >
                              <span>TRACE THE INTERCONNECTED THREAD</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>

                        {/* Right Column: Physical Visual Evidence Artifacts */}
                        <div className="lg:col-span-5 space-y-4">
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#8E939E] pb-1 border-b border-[#232730]">
                            <span className="flex items-center space-x-1.5">
                              <Eye className="w-3 h-3 text-[#CFA04E]" />
                              <span>PHYSICAL EVIDENCE ({evidenceReceipts.length})</span>
                            </span>
                            <span>CORROBORATING ARTIFACTS</span>
                          </div>

                          <div className="space-y-4">
                            {evidenceReceipts.map((receipt, rIdx) => (
                              <div
                                key={receipt.id}
                                className="transform hover:scale-[1.01] transition-transform"
                              >
                                <ReceiptItem
                                  receipt={receipt}
                                  isSelected={activeEvidenceReceiptId === receipt.id}
                                  isConnected={false}
                                  isDimmed={false}
                                  index={rIdx}
                                  onSelect={(r) => {
                                    setActiveEvidenceReceiptId(r.id);
                                    onSelectReceipt(r);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>

                {/* Complete Chapter Evidence Ledger Drawer */}
                <div className="mt-12 p-6 rounded-2xl bg-[#0C0E14] border border-[#232730] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-editorial text-lg text-[#FAF8F5]">
                        All Documented Traces in Chapter {chapter.number}
                      </h4>
                      <p className="font-mono text-xs text-[#8E939E] mt-0.5">
                        {chapterReceipts.length} discrete artifacts recorded between{' '}
                        {new Date(chapter.period.start).toLocaleDateString()} and{' '}
                        {new Date(chapter.period.end).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-[#8E939E]">FILTER:</span>
                      <select
                        aria-label="Filter evidence category"
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="bg-[#151821] border border-[#2E3646] text-[#FAF8F5] rounded-lg px-2.5 py-1 text-xs outline-none"
                      >
                        <option value="all">All Evidence Types</option>
                        <option value="purchases">Thermal Receipts</option>
                        <option value="movies">Film Frame Tickets</option>
                        <option value="music">Vinyl Sound Sleeves</option>
                        <option value="places">Architectural Coordinates</option>
                        <option value="photos">Darkroom Prints</option>
                        <option value="notes">Field Memos</option>
                      </select>
                    </div>
                  </div>

                  {/* Evidence Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapterReceipts
                      .filter(
                        (r) => selectedCategoryFilter === 'all' || r.type === selectedCategoryFilter
                      )
                      .map((receipt) => (
                        <ReceiptItem
                          key={receipt.id}
                          receipt={receipt}
                          isSelected={activeEvidenceReceiptId === receipt.id}
                          isConnected={false}
                          isDimmed={false}
                          onSelect={(r) => {
                            setActiveEvidenceReceiptId(r.id);
                            onSelectReceipt(r);
                          }}
                        />
                      ))}
                  </div>
                </div>

                {/* Chapter Separator Bar */}
                {viewMode === 'continuous' && globalChapterIndex < archive.chapters.length - 1 && (
                  <div className="py-16 text-center">
                    <div className="inline-flex items-center space-x-3 text-xs font-mono text-[#8E939E]">
                      <span className="w-12 h-[1px] bg-[#2A303D]" />
                      <span>CONTINUE TO CHAPTER 0{globalChapterIndex + 2}</span>
                      <span className="w-12 h-[1px] bg-[#2A303D]" />
                    </div>
                  </div>
                )}
              </article>
            );
          })}
      </div>

      {/* 4. SINGLE CHAPTER MODE PAGINATION FOOTER */}
      {viewMode === 'single' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 border-t border-[#232730] mt-16 flex items-center justify-between">
          <button
            id="single-prev-btn"
            disabled={activeChapterIndex === 0}
            onClick={() => scrollToChapter(Math.max(0, activeChapterIndex - 1))}
            className="px-4 py-2.5 rounded-lg bg-[#11141B] border border-[#232730] text-xs font-mono text-[#FAF8F5] disabled:opacity-30 hover:bg-[#181D26] transition-all"
          >
            ← PREVIOUS CHAPTER
          </button>

          <span className="text-xs font-mono text-[#8E939E]">
            CHAPTER {activeChapterIndex + 1} OF {archive.chapters.length}
          </span>

          <button
            id="single-next-btn"
            disabled={activeChapterIndex === archive.chapters.length - 1}
            onClick={() => scrollToChapter(Math.min(archive.chapters.length - 1, activeChapterIndex + 1))}
            className="px-4 py-2.5 rounded-lg bg-[#CFA04E] text-[#07080A] text-xs font-mono font-bold disabled:opacity-30 hover:bg-[#E0B25E] transition-all"
          >
            NEXT CHAPTER →
          </button>
        </div>
      )}

      {/* 5. EDITORIAL EPILOGUE & ARCHIVAL COLOPHON */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 mt-24 border-t border-[#232730] text-center space-y-6">
        <div className="font-editorial text-2xl sm:text-3xl text-[#FAF8F5] font-light italic">
          “Every moment leaves a physical trace. The life is what exists between them.”
        </div>
        <div className="text-xs font-mono text-[#6B7280]">
          TRACERI ARCHIVE VOL. 1 · DETERMINISTIC ENGINE VER. 2.4 · NO MACHINE HALLUCINATIONS
        </div>
      </footer>
    </div>
  );
};
