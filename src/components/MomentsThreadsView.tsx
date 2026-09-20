import React, { useState } from 'react';
import { ProcessedArchive, LifeThread, LifeReceipt } from '../types';
import { CATEGORY_META } from '../utils/engine';
import { ReceiptItem } from './ReceiptItem';
import {
  ArrowRight,
  Play,
  ChevronRight,
  Sparkles,
  Repeat,
} from 'lucide-react';

interface MomentsThreadsViewProps {
  archive: ProcessedArchive;
  onSelectReceipt: (receipt: LifeReceipt) => void;
  activeThreadId?: string | null;
}

export const MomentsThreadsView: React.FC<MomentsThreadsViewProps> = ({
  archive,
  onSelectReceipt,
  activeThreadId,
}) => {
  const [selectedThread, setSelectedThread] = useState<LifeThread>(
    archive.threads.find((t) => t.id === activeThreadId) || archive.threads[0]
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);

  // Sync selected thread when activeThreadId changes (e.g. from deep link query params)
  React.useEffect(() => {
    if (activeThreadId) {
      const match = archive.threads.find((t) => t.id === activeThreadId);
      if (match) {
        setSelectedThread(match);
        setCurrentStepIndex(0);
      }
    }
  }, [activeThreadId, archive.threads]);

  // Thread receipt objects
  const threadReceipts = selectedThread
    ? selectedThread.receiptIds
        .map((id) => archive.receipts.find((r) => r.id === id))
        .filter((r): r is LifeReceipt => Boolean(r))
    : [];

  // Play animation sequence through thread
  const handlePlayThread = () => {
    setIsPlayingSequence(true);
    setCurrentStepIndex(0);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < threadReceipts.length) {
        setCurrentStepIndex(idx);
      } else {
        clearInterval(interval);
        setIsPlayingSequence(false);
      }
    }, 1300);
  };

  const handleSelectThread = (thread: LifeThread) => {
    setSelectedThread(thread);
    setCurrentStepIndex(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
      
      {/* SECTION 1: THE LIFE THREADS */}
      <section className="space-y-8">
        <div className="border-b border-[#232730] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#CFA04E] uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RELATIONAL CONTINUITY ENGINE</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#FAF8F5] tracking-tight">
              Life Threads
            </h2>
          </div>
          <p className="font-sans text-xs text-[#8E939E] max-w-md leading-relaxed">
            Interconnected trajectories that trace specific behavioral motifs, recurring routines, and cultural journeys through the user’s life data.
          </p>
        </div>

        {/* THREAD CARDS: Visual Identity & Unique Editorial Labels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {archive.threads.map((thread) => {
            const isSelected = selectedThread?.id === thread.id;
            const themeColor = thread.themeColor || '#CFA04E';

            return (
              <button
                key={thread.id}
                id={`thread-card-${thread.id}`}
                onClick={() => handleSelectThread(thread)}
                style={{
                  borderColor: isSelected ? themeColor : undefined,
                }}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[#151922] shadow-2xl ring-2'
                    : 'bg-[#0E1015] border-[#222733] hover:border-[#353D4F] hover:bg-[#13161F]'
                }`}
              >
                {/* Visual Identity Accents */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: themeColor }}
                />

                <div>
                  {/* Editorial Label & Code */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      style={{
                        backgroundColor: thread.themeBg || 'rgba(207,160,78,0.15)',
                        color: themeColor,
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wide uppercase border border-white/5"
                    >
                      {thread.editorialLabel || thread.code}
                    </span>

                    <span className="text-[10px] font-mono text-[#8E939E] px-2 py-0.5 rounded bg-black/40">
                      {thread.receiptIds.length} ARTIFACTS
                    </span>
                  </div>

                  <h3 className="font-editorial text-xl font-medium text-[#FAF8F5] leading-snug group-hover:text-white transition-colors">
                    {thread.title}
                  </h3>

                  {/* Thumbnail Graphic preview if present */}
                  {thread.graphicUrl && (
                    <div className="mt-3.5 h-24 rounded-lg overflow-hidden border border-white/10 relative">
                      <img
                        src={thread.graphicUrl}
                        alt={thread.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-white/80">
                        {thread.code}
                      </span>
                    </div>
                  )}

                  {/* Pattern Cadence Indicator */}
                  {thread.patternCadence && (
                    <div className="mt-3 text-[11px] font-mono text-[#9CA3AF] flex items-center space-x-1.5 truncate">
                      <Repeat className="w-3 h-3 text-[#CFA04E] flex-shrink-0" />
                      <span className="truncate">{thread.patternCadence}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#8E939E]">
                  <span className="truncate max-w-[180px]">{thread.narrativeAnnotation}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-[#FAF8F5] translate-x-1' : 'opacity-40'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE THREAD DEEP SPOTLIGHT & SEQUENCE STAGES */}
        {selectedThread && (
          <div
            style={{
              borderColor: selectedThread.themeColor || '#242934',
            }}
            className="bg-[#10131B] border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-500"
          >
            {/* Top Distinct Identity Badge Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-8 border-b border-[#232A38]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      backgroundColor: selectedThread.themeBg || 'rgba(207,160,78,0.2)',
                      color: selectedThread.themeColor || '#CFA04E',
                    }}
                    className="px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase border border-white/10"
                  >
                    {selectedThread.editorialLabel || selectedThread.code}
                  </span>
                  <span className="text-xs font-mono text-[#8E939E]">
                    {selectedThread.code} · {threadReceipts.length} DOCUMENTED TRACES
                  </span>
                </div>

                <h3 className="font-editorial text-3xl sm:text-4xl text-[#FAF8F5] leading-tight">
                  {selectedThread.title}
                </h3>

                <div className="font-mono text-xs text-[#9CA3AF] flex flex-wrap items-center gap-3 pt-1">
                  {selectedThread.patternType && (
                    <span className="flex items-center space-x-1 text-[#569CA6]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{selectedThread.patternType}</span>
                    </span>
                  )}
                  <span>·</span>
                  <span className="text-[#CFA04E]">{selectedThread.patternCadence}</span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  id="play-thread-animation-btn"
                  disabled={isPlayingSequence}
                  onClick={handlePlayThread}
                  style={{
                    backgroundColor: selectedThread.themeColor || '#CFA04E',
                  }}
                  className="px-5 py-2.5 rounded-xl text-[#07080A] font-mono text-xs font-bold hover:brightness-110 transition-all flex items-center space-x-2 shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlayingSequence ? 'ANIMATING CADENCE...' : 'ANIMATE SEQUENCE'}</span>
                </button>
              </div>
            </div>

            {/* Sequence Stages Pipeline */}
            {selectedThread.sequenceStages && selectedThread.sequenceStages.length > 0 && (
              <div className="mb-8 p-5 rounded-xl bg-[#0D1017] border border-[#202735]">
                <div className="flex items-center justify-between text-xs font-mono text-[#8E939E] mb-3">
                  <span className="uppercase tracking-widest text-[#FAF8F5] font-semibold">
                    DISCOVERED SEQUENCE PIPELINE
                  </span>
                  <span>{selectedThread.sequenceStages.length} SEQUENTIAL STAGES</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {selectedThread.sequenceStages.map((stage, sIdx) => {
                    const isPassed = currentStepIndex >= sIdx;
                    return (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-lg border transition-all ${
                          isPassed
                            ? 'bg-[#151923] border-[#3B4559] text-[#FAF8F5]'
                            : 'bg-[#0A0C11] border-[#1C212B] text-[#6B7280]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="font-bold text-[#CFA04E]">STAGE 0{sIdx + 1}</span>
                          <span className="opacity-60">{stage.stage}</span>
                        </div>
                        <p className="text-xs font-sans leading-snug line-clamp-2">
                          {stage.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visual Node Chain of Actual Physical Receipt Artifacts */}
            <div className="overflow-x-auto py-4 scrollbar-none">
              <div className="flex items-stretch space-x-5 min-w-[800px]">
                {threadReceipts.map((receipt, idx) => {
                  const isCurrent = currentStepIndex === idx;
                  const isPast = idx < currentStepIndex;

                  return (
                    <React.Fragment key={receipt.id}>
                      {/* Interactive Receipt Card in Thread */}
                      <div
                        id={`thread-node-${idx}`}
                        onClick={() => {
                          setCurrentStepIndex(idx);
                          onSelectReceipt(receipt);
                        }}
                        style={{
                          borderColor: isCurrent ? selectedThread.themeColor || '#CFA04E' : undefined,
                        }}
                        className={`w-72 flex-shrink-0 transition-all duration-300 cursor-pointer ${
                          isCurrent
                            ? 'scale-105 z-20 shadow-2xl'
                            : isPast
                            ? 'opacity-85 hover:opacity-100'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-[#8E939E] mb-1.5 flex items-center justify-between px-1">
                          <span className="font-bold text-[#FAF8F5]">STEP 0{idx + 1}</span>
                          <span>{receipt.id}</span>
                        </div>

                        <ReceiptItem
                          receipt={receipt}
                          isSelected={isCurrent}
                          isConnected={false}
                          isDimmed={false}
                          index={idx}
                          onSelect={() => {
                            setCurrentStepIndex(idx);
                            onSelectReceipt(receipt);
                          }}
                        />
                      </div>

                      {/* Connection Link Arrow & Reason */}
                      {idx < threadReceipts.length - 1 && (
                        <div className="flex flex-col items-center justify-center flex-shrink-0 px-1 text-center">
                          <div className="h-[2px] w-8 bg-[#2F374A] relative flex items-center justify-center">
                            <ArrowRight
                              style={{ color: selectedThread.themeColor || '#CFA04E' }}
                              className="w-4 h-4 absolute right-0 translate-x-1"
                            />
                          </div>
                          <span className="text-[8px] font-mono text-[#8E939E] mt-2 tracking-widest uppercase">
                            LINK
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Currently Focused Step Details Banner */}
            {threadReceipts[currentStepIndex] && (
              <div className="mt-8 pt-6 border-t border-[#232A38] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center space-x-3">
                  <span
                    style={{ color: selectedThread.themeColor || '#CFA04E' }}
                    className="font-bold"
                  >
                    FOCUSED STEP {currentStepIndex + 1} OF {threadReceipts.length}
                  </span>
                  <span className="text-[#8E939E]">·</span>
                  <span className="text-[#FAF8F5] font-semibold">
                    {threadReceipts[currentStepIndex].title}
                  </span>
                </div>

                <button
                  id="inspect-thread-receipt-btn"
                  onClick={() => onSelectReceipt(threadReceipts[currentStepIndex])}
                  className="px-3.5 py-1.5 rounded-lg bg-[#161B24] border border-[#2B3444] text-[#FAF8F5] hover:border-[#CFA04E] hover:text-[#CFA04E] transition-all flex items-center space-x-1.5"
                >
                  <span>INSPECT DETAILED ARTIFACT</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: SPATIO-TEMPORAL CLUSTERED MOMENTS */}
      <section className="border-t border-[#232730] pt-12 space-y-8">
        <div className="border-b border-[#232730] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-[#76B896] uppercase tracking-widest mb-1">
              SPATIO-TEMPORAL CONVERGENCE
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#FAF8F5]">
              Clustered Moments
            </h2>
          </div>
          <p className="font-sans text-xs text-[#8E939E] max-w-md">
            When multiple categories occur within a 90-minute window in a singular spatial context.
            These represent experiential chapters of your daily life.
          </p>
        </div>

        {/* Moments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {archive.moments.map((moment) => {
            const dateStr = new Date(moment.timestamp).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={moment.id}
                id={`moment-card-${moment.id}`}
                className="bg-[#11141B] border border-[#232730] rounded-xl p-6 hover:border-[#3A4252] transition-all shadow-lg group"
              >
                {/* Moment Header */}
                <div className="flex items-start justify-between border-b border-[#232730] pb-4 mb-4">
                  <div>
                    <div className="font-mono text-[11px] text-[#8E939E] flex items-center space-x-2">
                      <span>{dateStr}</span>
                      <span>·</span>
                      <span className="text-[#CFA04E] font-semibold">{moment.durationMinutes} MIN DURATION</span>
                    </div>
                    <h4 className="font-editorial text-xl text-[#FAF8F5] mt-1 group-hover:text-[#CFA04E] transition-colors">
                      {moment.title}
                    </h4>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#1C2028] text-[#8E939E] border border-[#2A313E]">
                    {moment.receipts.length} TRACES
                  </span>
                </div>

                {/* Visual Sequence of Traces within Moment */}
                <div className="space-y-3">
                  {moment.receipts.map((r) => {
                    const cat = CATEGORY_META[r.type];
                    const timeStr = new Date(r.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    });

                    return (
                      <div
                        key={r.id}
                        onClick={() => onSelectReceipt(r)}
                        className="p-2.5 rounded bg-[#161922] border border-[#242A36] hover:border-[#3A4252] cursor-pointer flex items-center justify-between group/trace transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-[11px] text-[#8E939E]">
                            {timeStr}
                          </span>
                          <span
                            className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs text-[#FAF8F5] font-medium truncate max-w-[220px] sm:max-w-xs group-hover/trace:text-[#CFA04E] transition-colors">
                            {r.title}
                          </span>
                        </div>
                        <span style={{ color: cat.color }} className="text-[10px] font-mono uppercase font-semibold">
                          {cat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
};
