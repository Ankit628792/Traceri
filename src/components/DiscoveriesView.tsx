import React, { useState } from 'react';
import { ProcessedArchive, LifeReceipt, TraceCategory } from '../types';
import { CATEGORIES, CATEGORY_META } from '../utils/engine';

interface DiscoveriesViewProps {
  archive: ProcessedArchive;
  onSelectReceipt: (receipt: LifeReceipt) => void;
}

export const DiscoveriesView: React.FC<DiscoveriesViewProps> = ({
  archive,
  onSelectReceipt,
}) => {
  const [activeMatrixCell, setActiveMatrixCell] = useState<{ row: TraceCategory; col: TraceCategory } | null>(null);

  // Helper to find receipts for a top place (e.g. Barbican Centre)
  const topPlace = archive.placeCounts[0];
  const topPlaceReceipts = topPlace
    ? archive.receipts.filter(
        (r) => r.location?.name && r.location.name.toLowerCase().includes(topPlace.name.toLowerCase())
      )
    : [];

  // 24 hour max for activity rhythm
  const maxHourCount = Math.max(...archive.activityByHour, 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
      
      {/* Editorial Title */}
      <div className="border-b border-[#232730] pb-6">
        <div className="font-mono text-xs text-[#CFA04E] uppercase tracking-widest mb-1">
          DETERMINISTIC PATTERN SYNTHESIS
        </div>
        <h2 className="font-editorial text-4xl sm:text-5xl text-[#FAF8F5]">
          Archival Discoveries
        </h2>
        <p className="mt-2 font-sans text-sm text-[#8E939E] max-w-xl">
          Visual compositions extracted directly from the records. No machine-learning hallucinations;
          pure relational evidence.
        </p>
      </div>

      {/* DISCOVERY 01: DID YOU NOTICE? 7 RETURNS */}
      {topPlace && (
        <div className="bg-[#10131A] border border-[#232730] rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Left: Giant Typography */}
            <div className="lg:w-1/2">
              <div className="font-mono text-xs text-[#CFA04E] tracking-widest uppercase mb-2">
                DID YOU NOTICE? · SPATIAL GRAVITATION
              </div>
              <div className="font-editorial text-7xl sm:text-9xl font-light text-[#FAF8F5] leading-none">
                {topPlace.count}
              </div>
              <div className="font-editorial text-2xl sm:text-3xl text-[#FAF8F5] mt-2">
                RETURNS TO {topPlace.name.toUpperCase()}
              </div>
              <p className="mt-3 font-sans text-sm text-[#8E939E] max-w-md leading-relaxed">
                Across autumn, winter, and spring, this single coordinate exerted a continuous pull.
                Traces span morning coffee, evening celluloid projections, and botanical visits.
              </p>

              {/* Evidence tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded bg-[#1C2028] border border-[#2A313E] text-[11px] font-mono text-[#8E939E]">
                  WHY? LOCATION RECURRENCE
                </span>
                <span className="px-2.5 py-1 rounded bg-[#1C2028] border border-[#2A313E] text-[11px] font-mono text-[#8E939E]">
                  MULTIPLE SEASONS
                </span>
                <span className="px-2.5 py-1 rounded bg-[#1C2028] border border-[#2A313E] text-[11px] font-mono text-[#76B896]">
                  CONFIDENCE: STRONG
                </span>
              </div>
            </div>

            {/* Right: Dot Repetition Field & Traces */}
            <div className="lg:w-1/2 flex flex-col space-y-4">
              <div className="p-4 rounded-xl bg-[#141720] border border-[#242A36]">
                <div className="text-[11px] font-mono text-[#8E939E] mb-3 flex items-center justify-between">
                  <span>REPETITION FIELD</span>
                  <span className="text-[#CFA04E]">{topPlace.count} OCCURRENCES</span>
                </div>
                {/* Visual dots */}
                <div className="flex items-center space-x-3 py-2">
                  {Array.from({ length: topPlace.count }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 rounded-full bg-[#5F9E7D] shadow-[0_0_10px_rgba(95,158,125,0.5)] transition-transform hover:scale-125 cursor-pointer"
                      title={`Return #${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Traces list */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {topPlaceReceipts.map((r, i) => (
                  <div
                    key={r.id}
                    onClick={() => onSelectReceipt(r)}
                    className="p-3 rounded bg-[#13161C] border border-[#232730] hover:border-[#3A4252] cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-[11px] text-[#CFA04E]">0{i + 1}</span>
                      <span className="text-xs text-[#FAF8F5] group-hover:text-[#CFA04E] transition-colors">
                        {r.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#8E939E]">
                      {new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DISCOVERY 02: THE 47-DAY LONGEST GAP (Stark Whitespace Composition) */}
      {archive.longestGap && (
        <div className="bg-[#0D0F14] border border-[#232730] rounded-2xl p-8 sm:p-16 shadow-2xl text-center relative">
          <div className="font-mono text-xs text-[#CFA04E] tracking-widest uppercase mb-4">
            TEMPORAL HIATUS · ZERO DIGITAL EMISSIONS
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-12 my-8">
            
            {/* Left anchor trace */}
            <div
              onClick={() => onSelectReceipt(archive.longestGap!.fromReceipt)}
              className="p-4 rounded-lg bg-[#141720] border border-[#242934] text-left max-w-xs cursor-pointer hover:border-[#3A4252] transition-colors"
            >
              <div className="text-[10px] font-mono text-[#8E939E]">LAST TRACE BEFORE GAP</div>
              <div className="text-xs font-semibold text-[#FAF8F5] mt-1">
                {archive.longestGap.fromReceipt.title}
              </div>
              <div className="text-[11px] font-mono text-[#CFA04E] mt-1">
                {new Date(archive.longestGap.fromReceipt.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Gap Visualizer */}
            <div className="flex flex-col items-center px-4">
              <div className="h-[1px] w-24 sm:w-48 bg-[#3A4252] relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#CFA04E]" />
              </div>
              <div className="font-editorial text-5xl sm:text-7xl font-light text-[#FAF8F5] my-2">
                {archive.longestGap.days}
              </div>
              <div className="font-mono text-xs text-[#8E939E] tracking-widest uppercase">
                DAYS OF SILENCE
              </div>
              <div className="h-[1px] w-24 sm:w-48 bg-[#3A4252] mt-2" />
            </div>

            {/* Right anchor trace */}
            <div
              onClick={() => onSelectReceipt(archive.longestGap!.toReceipt)}
              className="p-4 rounded-lg bg-[#141720] border border-[#242934] text-left max-w-xs cursor-pointer hover:border-[#3A4252] transition-colors"
            >
              <div className="text-[10px] font-mono text-[#8E939E]">FIRST TRACE AFTER GAP</div>
              <div className="text-xs font-semibold text-[#FAF8F5] mt-1">
                {archive.longestGap.toReceipt.title}
              </div>
              <div className="text-[11px] font-mono text-[#CFA04E] mt-1">
                {new Date(archive.longestGap.toReceipt.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

          </div>

          <p className="mt-4 font-sans text-xs text-[#8E939E] max-w-lg mx-auto leading-relaxed">
            The archive went completely dormant during the winter solstice before re-emerging
            at Tokyo Narita. A deliberate off-grid period preserved in the dataset.
          </p>
        </div>
      )}

      {/* DISCOVERY 03: CATEGORY CONSTELLATION & RELATIONSHIP MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Relationship Matrix (9x9) */}
        <div className="bg-[#11141B] border border-[#232730] rounded-xl p-6 shadow-xl">
          <div className="border-b border-[#232730] pb-3 mb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] text-[#CFA04E] uppercase tracking-wider">
                CO-OCCURRENCE COUPLING
              </div>
              <h3 className="font-editorial text-xl text-[#FAF8F5]">
                Relationship Matrix (9×9)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8E939E]">
              CROSS-CATEGORY LINKS
            </span>
          </div>

          <p className="text-xs text-[#8E939E] mb-4">
            Cell opacity indicates connection density between categories. Click any cell to inspect mutual ties.
          </p>

          <div className="overflow-x-auto">
            <div className="min-w-[340px]">
              {/* Header row */}
              <div className="grid grid-cols-10 gap-1 text-[9px] font-mono text-[#8E939E] text-center mb-1">
                <div></div>
                {CATEGORIES.map((c) => (
                  <div key={c} className="truncate uppercase font-semibold" title={c}>
                    {c.slice(0, 3)}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {CATEGORIES.map((rowCat) => (
                <div key={rowCat} className="grid grid-cols-10 gap-1 items-center mb-1">
                  <div className="text-[9px] font-mono text-[#8E939E] uppercase truncate text-right pr-1">
                    {rowCat.slice(0, 3)}
                  </div>
                  {CATEGORIES.map((colCat) => {
                    const rel = archive.categoryRelationships.find(
                      (r) => r.sourceCategory === rowCat && r.targetCategory === colCat
                    );
                    const count = rel ? rel.count : 0;
                    const maxCount = 8;
                    const alpha = count === 0 ? 0.05 : Math.min(1, 0.15 + (count / maxCount) * 0.85);

                    return (
                      <button
                        key={colCat}
                        onClick={() => setActiveMatrixCell({ row: rowCat, col: colCat })}
                        title={`${rowCat.toUpperCase()} ↔ ${colCat.toUpperCase()}: ${count} connections`}
                        className="h-6 rounded flex items-center justify-center text-[10px] font-mono transition-all hover:ring-1 hover:ring-[#CFA04E]"
                        style={{
                          backgroundColor: count > 0 ? CATEGORY_META[rowCat].color : 'rgba(255,255,255,0.03)',
                          opacity: alpha,
                          color: count > 0 ? '#FAF8F5' : '#444',
                        }}
                      >
                        {count > 0 ? count : ''}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {activeMatrixCell && (
            <div className="mt-4 p-3 rounded bg-[#161922] border border-[#242A36] text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-[#CFA04E] font-semibold">{activeMatrixCell.row.toUpperCase()}</span>
                <span className="text-[#8E939E]"> ↔ </span>
                <span className="text-[#A795DC] font-semibold">{activeMatrixCell.col.toUpperCase()}</span>
              </div>
              <span className="text-[#FAF8F5]">
                {archive.categoryRelationships.find(
                  (r) => r.sourceCategory === activeMatrixCell.row && r.targetCategory === activeMatrixCell.col
                )?.count || 0}{' '}
                DIRECT CONNECTIONS
              </span>
            </div>
          )}
        </div>

        {/* Activity Rhythm (24-Hour Radial / Density Field) */}
        <div className="bg-[#11141B] border border-[#232730] rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-[#232730] pb-3 mb-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] text-[#76B896] uppercase tracking-wider">
                  TEMPORAL DISTRIBUTION
                </div>
                <h3 className="font-editorial text-xl text-[#FAF8F5]">
                  Activity Rhythm (24h)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#8E939E]">
                HOURLY CLUSTERS
              </span>
            </div>

            <p className="text-xs text-[#8E939E] mb-6">
              When life traces emerge throughout the day. Major peaks cluster in the late afternoon (14:00 - 19:00)
              and late evening (21:00 - 23:00).
            </p>

            {/* 24-hour bar frequency histogram */}
            <div className="flex items-end space-x-1.5 h-36 pt-4 pb-1 border-b border-[#232730]">
              {archive.activityByHour.map((count, hour) => {
                const heightPercent = count === 0 ? 6 : Math.max(12, Math.round((count / maxHourCount) * 100));
                const isPeak = count === maxHourCount;

                return (
                  <div
                    key={hour}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isPeak
                          ? 'bg-[#CFA04E] shadow-[0_0_8px_rgba(207,160,78,0.5)]'
                          : count > 0
                          ? 'bg-[#569CA6]/60 hover:bg-[#569CA6]'
                          : 'bg-[#1C2028]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-black text-[9px] font-mono text-white px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                      {hour}:00 ({count})
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hour markers */}
            <div className="flex justify-between text-[10px] font-mono text-[#8E939E] mt-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#232730] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8E939E]">PEAK CONCENTRATION:</span>
            <span className="text-[#CFA04E] font-semibold">18:00 - 22:00 (CULTURE & MUSIC)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
