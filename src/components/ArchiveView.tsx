import React, { useState, useMemo } from 'react';
import { ProcessedArchive, LifeReceipt, TraceCategory } from '../types';
import { CATEGORIES, CATEGORY_META } from '../utils/engine';
import { ReceiptItem } from './ReceiptItem';
import { ArchiveVisualizations } from './ArchiveVisualizations';
import { Search, X, Calendar, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface ArchiveViewProps {
  archive: ProcessedArchive;
  selectedReceipt: LifeReceipt | null;
  onSelectReceipt: (receipt: LifeReceipt) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  archive,
  selectedReceipt,
  onSelectReceipt,
}) => {
  const [activeCategory, setActiveCategory] = useState<TraceCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredReceipt, setHoveredReceipt] = useState<LifeReceipt | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | 'ALL'>('ALL');
  const [showVisualizations, setShowVisualizations] = useState<boolean>(true);

  // Count traces by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: archive.receipts.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = archive.receipts.filter((r) => r.type === cat).length;
    });
    return counts;
  }, [archive]);

  // Group receipts by month for temporal scrubbing
  const months = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    archive.receipts.forEach((r) => {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!map.has(key)) {
        map.set(key, { label, count: 0 });
      }
      map.get(key)!.count += 1;
    });
    return Array.from(map.entries()).map(([key, data]) => ({ key, ...data }));
  }, [archive]);

  // Determine connected receipt IDs when hovering or selecting
  const activeFocusReceipt = selectedReceipt || hoveredReceipt;
  const connectedIds = useMemo(() => {
    if (!activeFocusReceipt) return new Set<string>();
    const ids = new Set<string>();
    archive.connections.forEach((c) => {
      if (c.from === activeFocusReceipt.id) ids.add(c.to);
      if (c.to === activeFocusReceipt.id) ids.add(c.from);
    });
    return ids;
  }, [activeFocusReceipt, archive]);

  // Filter receipts based on category, month, and search query
  const filteredReceipts = useMemo(() => {
    return archive.receipts.filter((r) => {
      // Category filter
      if (activeCategory !== 'ALL' && r.type !== activeCategory) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'ALL') {
        const d = new Date(r.timestamp);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key !== selectedMonth) return false;
      }

      // Search query filter (matches title, subtitle, description, entities, location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesSub = r.subtitle?.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q);
        const matchesLoc = r.location?.name.toLowerCase().includes(q) || r.location?.city.toLowerCase().includes(q);
        const matchesEntities = r.entities.some((e) => e.toLowerCase().includes(q));
        const matchesId = r.id.toLowerCase().includes(q);

        if (!matchesTitle && !matchesSub && !matchesDesc && !matchesLoc && !matchesEntities && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [archive.receipts, activeCategory, selectedMonth, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Controls: Editorial Search + Temporal Scrubber */}
      <div className="mb-8 space-y-4">
        
        {/* Editorial Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E939E]">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="archive-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH THE ARCHIVE (e.g. “Barbican”, “Solaris”, “Vinyl”, “Kyoto”, “35mm”)..."
            className="w-full pl-12 pr-10 py-3.5 bg-[#12141C] border border-[#242934] rounded-lg text-sm text-[#FAF8F5] placeholder-[#5A5E66] font-mono focus:outline-none focus:border-[#CFA04E] focus:ring-1 focus:ring-[#CFA04E] transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              id="archive-search-clear-btn"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8E939E] hover:text-[#FAF8F5]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Minimal Category Filter System */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* ALL */}
            <button
              id="filter-cat-all"
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1 text-xs font-mono rounded transition-all flex items-center space-x-1.5 ${
                activeCategory === 'ALL'
                  ? 'bg-[#FAF8F5] text-[#0A0B0D] font-semibold'
                  : 'text-[#8E939E] hover:text-[#FAF8F5] bg-[#12141C] border border-[#242934]'
              }`}
            >
              <span>ALL</span>
              <span className="opacity-60 text-[10px]">({categoryCounts.ALL})</span>
            </button>

            {/* Each Category */}
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = categoryCounts[cat] || 0;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  id={`filter-cat-${cat}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'font-semibold text-white ring-1'
                      : 'text-[#8E939E] hover:text-[#FAF8F5] bg-[#12141C] border border-[#242934]'
                  }`}
                  style={{
                    backgroundColor: isActive ? meta.color : undefined,
                    borderColor: isActive ? meta.color : undefined,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span>{meta.label}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Temporal Scrubber Pills */}
          <div className="flex items-center space-x-1 text-xs font-mono">
            <span className="text-[#8E939E] mr-1 hidden md:inline">PERIOD:</span>
            <button
              id="period-filter-all"
              onClick={() => setSelectedMonth('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                selectedMonth === 'ALL'
                  ? 'bg-[#2A313E] text-[#FAF8F5] font-semibold'
                  : 'text-[#8E939E] hover:text-[#FAF8F5]'
              }`}
            >
              ALL TIME
            </button>
            {months.map((m) => (
              <button
                key={m.key}
                id={`period-filter-${m.key}`}
                onClick={() => setSelectedMonth(m.key)}
                className={`px-2 py-0.5 rounded text-[11px] flex items-center space-x-1 ${
                  selectedMonth === m.key
                    ? 'bg-[#CFA04E] text-[#0A0B0D] font-bold'
                    : 'text-[#8E939E] hover:text-[#FAF8F5]'
                }`}
              >
                <span>{m.label}</span>
                <span className="opacity-60 text-[9px]">({m.count})</span>
              </button>
            ))}
          </div>

        </div>

        {/* Auxiliary Controls: Recharts Data Visualizer Toggle & Life Calendar Shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1C202B]">
          <div className="flex items-center space-x-2">
            <button
              id="toggle-visualizations-btn"
              onClick={() => setShowVisualizations((prev) => !prev)}
              className={`px-3 py-1.5 rounded text-xs font-mono flex items-center space-x-2 transition-all ${
                showVisualizations
                  ? 'bg-[#CFA04E] text-[#0A0B0D] font-bold shadow-xs'
                  : 'bg-[#141822] text-[#8E939E] hover:text-[#FAF8F5] border border-[#242C3B]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{showVisualizations ? 'HIDE RECHARTS VISUALIZATION' : 'SHOW RECHARTS VISUALIZATION'}</span>
              {showVisualizations ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            <Link
              to="/calendar"
              id="archive-calendar-shortcut-btn"
              className="px-3 py-1.5 rounded text-xs font-mono flex items-center space-x-1.5 bg-[#141822] text-[#FAF8F5] hover:border-[#CFA04E] border border-[#242C3B] transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-[#CFA04E]" />
              <span>LIFE CALENDAR GRID</span>
              <span className="text-[10px] text-[#CFA04E]">→</span>
            </Link>
          </div>

          <span className="text-[11px] font-mono text-[#5A606E]">
            DATA ART & METRIC ENGINE · VOL. 01
          </span>
        </div>

      </div>

      {/* Render Recharts Editorial Section */}
      {showVisualizations && (
        <ArchiveVisualizations archive={archive} />
      )}

      {/* Active Filter Indicator & Results Count */}
      <div className="mb-6 flex items-center justify-between text-xs font-mono text-[#8E939E] border-b border-[#232730] pb-3">
        <div className="flex items-center space-x-2">
          <span>SHOWING</span>
          <span className="text-[#FAF8F5] font-semibold">{filteredReceipts.length}</span>
          <span>OF</span>
          <span>{archive.totalTraces} TRACES</span>
          {activeFocusReceipt && (
            <span className="ml-3 px-2 py-0.5 rounded bg-[#1C2028] text-[#CFA04E] text-[10px]">
              HIGHLIGHTING CONNECTIONS FOR {activeFocusReceipt.id}
            </span>
          )}
        </div>

        {searchQuery && (
          <span className="text-[#CFA04E]">
            MATCHING QUERY: “{searchQuery}”
          </span>
        )}
      </div>

      {/* Empty State */}
      {filteredReceipts.length === 0 && (
        <div className="py-24 text-center">
          <div className="font-editorial text-2xl text-[#FAF8F5] mb-2">
            NO TRACES FOUND
          </div>
          <p className="font-mono text-xs text-[#8E939E] max-w-sm mx-auto">
            No archival events match the current category and temporal filter parameters.
          </p>
          <button
            id="reset-archive-filters-btn"
            onClick={() => {
              setActiveCategory('ALL');
              setSelectedMonth('ALL');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded bg-[#1A1E26] text-xs font-mono text-[#FAF8F5] hover:bg-[#252C38] border border-[#2F3746]"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* RECEIPT FIELD: Tactical Editorial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredReceipts.map((receipt) => {
          const isSelected = selectedReceipt?.id === receipt.id;
          const isConnected = connectedIds.has(receipt.id);
          const isDimmed = activeFocusReceipt
            ? receipt.id !== activeFocusReceipt.id && !connectedIds.has(receipt.id)
            : false;

          return (
            <ReceiptItem
              key={receipt.id}
              receipt={receipt}
              isSelected={isSelected}
              isDimmed={isDimmed}
              isConnected={isConnected}
              onSelect={onSelectReceipt}
              onHover={setHoveredReceipt}
            />
          );
        })}
      </div>

      {/* Bottom Editorial Quote */}
      <div className="mt-16 pt-8 border-t border-[#232730] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#5A5E66] gap-4">
        <span>ARCHIVE VOL. 01 — PRESERVING RAW DIGITAL FOOTPRINTS</span>
        <span>SELECT ANY OBJECT TO REVEAL TEMPORAL & SPATIAL CONNECTIONS</span>
      </div>

    </div>
  );
};
