import React, { useState, useMemo } from 'react';
import { ProcessedArchive, LifeReceipt, TraceCategory } from '../types';
import { CATEGORIES, CATEGORY_META } from '../utils/engine';
import { ReceiptItem } from './ReceiptItem';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  Filter,
  Grid,
  Layers
} from 'lucide-react';

interface LifeCalendarProps {
  archive: ProcessedArchive;
  onSelectReceipt: (receipt: LifeReceipt) => void;
}

type CalendarViewMode = 'month' | 'annual';

export const LifeCalendar: React.FC<LifeCalendarProps> = ({
  archive,
  onSelectReceipt,
}) => {
  // Determine available months in the archive
  const availableMonths = useMemo(() => {
    const map = new Map<string, { year: number; month: number; label: string; count: number }>();
    archive.receipts.forEach((r) => {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) {
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        map.set(key, { year: d.getFullYear(), month: d.getMonth(), label, count: 0 });
      }
      map.get(key)!.count += 1;
    });

    const list = Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    return list;
  }, [archive.receipts]);

  // Default to the first month with data, or fallback to current
  const [currentYear, setCurrentYear] = useState<number>(() => {
    return availableMonths[0] ? availableMonths[0].year : new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return availableMonths[0] ? availableMonths[0].month : new Date().getMonth();
  });

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedCategory, setSelectedCategory] = useState<TraceCategory | 'ALL'>('ALL');
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Filter receipts by category if selected
  const filteredReceipts = useMemo(() => {
    if (selectedCategory === 'ALL') return archive.receipts;
    return archive.receipts.filter((r) => r.type === selectedCategory);
  }, [archive.receipts, selectedCategory]);

  // Map each day (YYYY-MM-DD) to its list of receipts
  const dayDensityMap = useMemo(() => {
    const map = new Map<string, LifeReceipt[]>();
    filteredReceipts.forEach((r) => {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(r);
    });
    return map;
  }, [filteredReceipts]);

  // Activity patterns & statistics
  const stats = useMemo(() => {
    let maxDay = { key: '', count: 0, dateStr: '' };
    const weekdayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let activeDaysCount = 0;

    dayDensityMap.forEach((receipts, key) => {
      if (receipts.length > 0) {
        activeDaysCount++;
        const d = new Date(receipts[0].timestamp);
        weekdayCounts[d.getDay()] = (weekdayCounts[d.getDay()] || 0) + receipts.length;

        if (receipts.length > maxDay.count) {
          maxDay = {
            key,
            count: receipts.length,
            dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        }
      }
    });

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let busiestDayIdx = 5; // default Friday
    let highestWeekdayCount = 0;
    Object.entries(weekdayCounts).forEach(([idxStr, count]) => {
      if (count > highestWeekdayCount) {
        highestWeekdayCount = count;
        busiestDayIdx = Number(idxStr);
      }
    });

    return {
      activeDaysCount,
      peakDay: maxDay,
      busiestWeekday: weekdays[busiestDayIdx],
      totalTraces: filteredReceipts.length,
    };
  }, [dayDensityMap, filteredReceipts]);

  // Automatically select the peak day or first active day of this month if none selected
  useMemo(() => {
    if (!selectedDayKey) {
      // Find first day in current month that has traces
      for (let day = 1; day <= 31; day++) {
        const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (dayDensityMap.has(key)) {
          setSelectedDayKey(key);
          break;
        }
      }
    }
  }, [currentYear, currentMonth, dayDensityMap]);

  // Calendar month days calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday as start of week (0 = Monday, 6 = Sunday)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const days = [];

    // Blank padding before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ type: 'padding', dayNum: null, dateKey: null, receipts: [] });
    }

    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const receipts = dayDensityMap.get(dateKey) || [];
      days.push({ type: 'day', dayNum: day, dateKey, receipts });
    }

    return days;
  }, [currentYear, currentMonth, dayDensityMap]);

  // Annual matrix days (all months of currentYear)
  const annualMatrixDays = useMemo(() => {
    const matrix: { dateKey: string; count: number; receipts: LifeReceipt[]; date: Date }[] = [];
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const receipts = dayDensityMap.get(key) || [];
      matrix.push({
        dateKey: key,
        count: receipts.length,
        receipts,
        date: new Date(d),
      });
    }

    return matrix;
  }, [currentYear, dayDensityMap]);

  // Get color and styling based on data density count
  const getDensityStyle = (count: number) => {
    if (count === 0) {
      return {
        bgClass: 'bg-[#10131A] hover:bg-[#151923] text-[#4E5566] border-[#1C212E]',
        dotColor: 'transparent',
        label: 'Empty',
      };
    }
    if (count === 1) {
      return {
        bgClass: 'bg-[#CFA04E]/15 hover:bg-[#CFA04E]/25 text-[#E4E1DB] border-[#CFA04E]/30',
        dotColor: '#CFA04E',
        label: '1 trace',
      };
    }
    if (count <= 3) {
      return {
        bgClass: 'bg-[#CFA04E]/35 hover:bg-[#CFA04E]/45 text-[#FAF8F5] border-[#CFA04E]/50 font-medium',
        dotColor: '#E5B55E',
        label: '2-3 traces',
      };
    }
    if (count <= 5) {
      return {
        bgClass: 'bg-[#CFA04E]/65 hover:bg-[#CFA04E]/75 text-[#0A0B0D] border-[#CFA04E] font-bold shadow-sm',
        dotColor: '#0A0B0D',
        label: '4-5 traces',
      };
    }
    return {
      bgClass: 'bg-[#CFA04E] hover:bg-[#E5B55E] text-[#0A0B0D] border-[#E8BF6C] font-black shadow-md shadow-[#CFA04E]/20 ring-1 ring-[#FAF8F5]/40',
      dotColor: '#0A0B0D',
      label: '6+ traces (Peak)',
    };
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Selected day items
  const selectedDayReceipts = selectedDayKey ? dayDensityMap.get(selectedDayKey) || [] : [];
  const formattedSelectedDate = selectedDayKey
    ? new Date(selectedDayKey + 'T12:00:00Z').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const selectedDayTotalSpend = selectedDayReceipts.reduce(
    (acc, cur) => acc + (cur.metadata.amount || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Editorial Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#232730] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest text-[#CFA04E] uppercase mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>TEMPORAL DENSITY ENGINE · ACTIVITY PATTERNS</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#FAF8F5] tracking-wide">
            Life Calendar & Footprint Density
          </h1>
          <p className="text-xs font-mono text-[#8E939E] mt-1 max-w-2xl">
            A chronological density matrix mapping the rhythm of days. Darker cells represent quiet intervals; golden luminous cells signify dense clusters of memory, acquisitions, and creative notes.
          </p>
        </div>

        {/* View Mode & Month Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month / Annual Switcher */}
          <div className="flex items-center space-x-1 p-1 bg-[#12151E] border border-[#232A3B] rounded-lg text-xs font-mono">
            <button
              id="calendar-view-month"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                viewMode === 'month'
                  ? 'bg-[#FAF8F5] text-[#0A0B0D] font-bold shadow-xs'
                  : 'text-[#8E939E] hover:text-[#FAF8F5]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>MONTH GRID</span>
            </button>
            <button
              id="calendar-view-annual"
              onClick={() => setViewMode('annual')}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                viewMode === 'annual'
                  ? 'bg-[#FAF8F5] text-[#0A0B0D] font-bold shadow-xs'
                  : 'text-[#8E939E] hover:text-[#FAF8F5]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ANNUAL MATRIX</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-xs font-mono">
        <div className="bg-[#10131B] border border-[#1F2533] p-4 rounded-lg">
          <span className="text-[10px] text-[#8E939E] uppercase tracking-wider block">ACTIVE FOOTPRINT DAYS</span>
          <div className="text-2xl font-editorial text-[#FAF8F5] mt-1">
            {stats.activeDaysCount} <span className="text-xs font-mono text-[#8E939E]">days</span>
          </div>
          <span className="text-[10px] text-[#569CA6] mt-0.5 block">With verified artifacts</span>
        </div>
        <div className="bg-[#10131B] border border-[#1F2533] p-4 rounded-lg">
          <span className="text-[10px] text-[#8E939E] uppercase tracking-wider block">PEAK ACTIVITY DAY</span>
          <div className="text-base font-editorial text-[#CFA04E] mt-1 font-semibold truncate">
            {stats.peakDay.dateStr || 'N/A'}
          </div>
          <span className="text-[10px] text-[#8E939E] mt-0.5 block">{stats.peakDay.count} events recorded</span>
        </div>
        <div className="bg-[#10131B] border border-[#1F2533] p-4 rounded-lg">
          <span className="text-[10px] text-[#8E939E] uppercase tracking-wider block">BUSIEST WEEKDAY</span>
          <div className="text-2xl font-editorial text-[#FAF8F5] mt-1">
            {stats.busiestWeekday}
          </div>
          <span className="text-[10px] text-[#8E939E] mt-0.5 block">Peak temporal confluence</span>
        </div>
        <div className="bg-[#10131B] border border-[#1F2533] p-4 rounded-lg">
          <span className="text-[10px] text-[#8E939E] uppercase tracking-wider block">DATA DENSITY RATIO</span>
          <div className="text-2xl font-mono text-[#CFA04E] font-bold mt-1">
            {(stats.totalTraces / (stats.activeDaysCount || 1)).toFixed(1)}
          </div>
          <span className="text-[10px] text-[#8E939E] mt-0.5 block">Traces per active day</span>
        </div>
      </div>

      {/* Category Filter Pills for Calendar Density */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#1E232F]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-[#8E939E] mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>FILTER DENSITY:</span>
          </span>
          <button
            id="cal-filter-all"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#FAF8F5] text-[#0A0B0D] font-bold'
                : 'text-[#8E939E] hover:text-[#FAF8F5] bg-[#12151E] border border-[#212735]'
            }`}
          >
            ALL ARTIFACTS ({archive.totalTraces})
          </button>
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const isSel = selectedCategory === cat;
            const count = archive.receipts.filter((r) => r.type === cat).length;
            return (
              <button
                key={cat}
                id={`cal-filter-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 text-xs font-mono rounded transition-all flex items-center space-x-1.5 ${
                  isSel
                    ? 'font-bold text-white'
                    : 'text-[#8E939E] hover:text-[#FAF8F5] bg-[#12151E] border border-[#212735]'
                }`}
                style={{
                  backgroundColor: isSel ? meta.color : undefined,
                  borderColor: isSel ? meta.color : undefined,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                <span>{meta.label}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Available Months Quick Jump */}
        <div className="flex items-center space-x-1 text-xs font-mono text-[#8E939E]">
          <span className="hidden sm:inline">DATA MONTHS:</span>
          {availableMonths.map((m) => (
            <button
              key={`${m.year}-${m.month}`}
              id={`jump-month-${m.year}-${m.month}`}
              onClick={() => {
                setCurrentYear(m.year);
                setCurrentMonth(m.month);
                setViewMode('month');
              }}
              className={`px-2 py-0.5 rounded text-[11px] ${
                currentYear === m.year && currentMonth === m.month
                  ? 'bg-[#CFA04E] text-[#0A0B0D] font-bold'
                  : 'hover:text-[#FAF8F5] bg-[#12151E]'
              }`}
            >
              {m.label.split(' ')[0]} ‘{String(m.year).slice(-2)}
            </button>
          ))}
        </div>
      </div>

      {/* --- MONTH VIEW --- */}
      {viewMode === 'month' && (
        <div className="space-y-6">
          
          {/* Month Navigation Bar */}
          <div className="flex items-center justify-between bg-[#12151E] border border-[#212735] px-4 py-3 rounded-lg">
            <button
              id="cal-prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1.5 rounded hover:bg-[#1A1F2C] text-[#8E939E] hover:text-[#FAF8F5] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="font-editorial text-xl sm:text-2xl text-[#FAF8F5] font-semibold tracking-wide">
                {new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="text-xs font-mono text-[#CFA04E] block">
                {calendarDays.reduce((acc, d) => acc + d.receipts.length, 0)} ARTIFACTS LOGGED THIS MONTH
              </span>
            </div>

            <button
              id="cal-next-month-btn"
              onClick={handleNextMonth}
              className="p-1.5 rounded hover:bg-[#1A1F2C] text-[#8E939E] hover:text-[#FAF8F5] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Density Heatmap Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#8E939E] px-1">
            <span>DENSITY CODING (RECORDED VOLUME):</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded bg-[#10131A] border border-[#1C212E] inline-block" />
                <span>0</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded bg-[#CFA04E]/20 border border-[#CFA04E]/40 inline-block" />
                <span>1</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded bg-[#CFA04E]/45 border border-[#CFA04E]/60 inline-block" />
                <span>2-3</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded bg-[#CFA04E]/75 border border-[#CFA04E] inline-block" />
                <span>4-5</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded bg-[#CFA04E] border border-[#E8BF6C] inline-block shadow-sm" />
                <span>6+ (Confluence)</span>
              </div>
            </div>
          </div>

          {/* 7-Day Column Grid */}
          <div className="border border-[#212735] rounded-xl overflow-hidden bg-[#0D0F16] shadow-xl">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-[#212735] bg-[#12151E] text-center text-xs font-mono text-[#8E939E] py-2.5">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-[1px] bg-[#212735]">
              {calendarDays.map((cell, idx) => {
                if (cell.type === 'padding') {
                  return (
                    <div
                      key={`pad-${idx}`}
                      className="min-h-[85px] sm:min-h-[105px] bg-[#0A0C11] opacity-30 p-2"
                    />
                  );
                }

                const count = cell.receipts.length;
                const density = getDensityStyle(count);
                const isSelected = selectedDayKey === cell.dateKey;

                // Unique categories present on this day
                const categoriesOnDay = Array.from(new Set(cell.receipts.map((r) => r.type)));

                return (
                  <div
                    key={cell.dateKey}
                    id={`cal-day-${cell.dateKey}`}
                    onClick={() => {
                      if (cell.dateKey) setSelectedDayKey(cell.dateKey);
                    }}
                    className={`min-h-[85px] sm:min-h-[105px] p-2.5 transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                      density.bgClass
                    } ${
                      isSelected
                        ? 'ring-2 ring-[#CFA04E] z-10 scale-[1.01] shadow-xl'
                        : ''
                    }`}
                  >
                    {/* Top Row: Day Number + Count Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-mono font-semibold">
                        {cell.dayNum}
                      </span>
                      {count > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-[#FAF8F5] border border-white/10">
                          {count} {count === 1 ? 'trace' : 'traces'}
                        </span>
                      )}
                    </div>

                    {/* Middle: Category Pip Icons */}
                    {count > 0 && (
                      <div className="my-1 flex flex-wrap gap-1">
                        {categoriesOnDay.map((cat) => (
                          <span
                            key={cat}
                            title={cat}
                            className="w-2 h-2 rounded-full inline-block ring-1 ring-black/40"
                            style={{ backgroundColor: CATEGORY_META[cat]?.color || '#CFA04E' }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Bottom: Snippet title or spend if available */}
                    {count > 0 && (
                      <div className="truncate text-[9px] font-mono opacity-85 group-hover:opacity-100">
                        {cell.receipts[0]?.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* --- ANNUAL MATRIX VIEW --- */}
      {viewMode === 'annual' && (
        <div className="bg-[#10131B] border border-[#212735] p-6 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E232F] gap-2">
            <div>
              <h3 className="font-editorial text-xl text-[#FAF8F5]">Year-at-a-Glance Density Ribbon ({currentYear})</h3>
              <p className="text-xs font-mono text-[#8E939E] mt-0.5">
                Full 365-day chronological matrix. Click any block to inspect traces for that specific date.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <button
                id="cal-annual-prev-year"
                onClick={() => setCurrentYear((y) => y - 1)}
                className="px-2 py-1 bg-[#161B26] hover:bg-[#202737] rounded text-[#FAF8F5]"
              >
                {currentYear - 1}
              </button>
              <span className="font-bold text-[#CFA04E]">{currentYear}</span>
              <button
                id="cal-annual-next-year"
                onClick={() => setCurrentYear((y) => y + 1)}
                className="px-2 py-1 bg-[#161B26] hover:bg-[#202737] rounded text-[#FAF8F5]"
              >
                {currentYear + 1}
              </button>
            </div>
          </div>

          {/* Chronological Grid of Squares */}
          <div className="grid grid-cols-12 sm:grid-cols-18 md:grid-cols-26 lg:grid-cols-31 gap-1.5 p-2 bg-[#0C0E14] border border-[#1E232F] rounded-lg overflow-x-auto">
            {annualMatrixDays.map((item) => {
              const density = getDensityStyle(item.count);
              const isSelected = selectedDayKey === item.dateKey;
              return (
                <button
                  key={item.dateKey}
                  id={`matrix-day-${item.dateKey}`}
                  onClick={() => setSelectedDayKey(item.dateKey)}
                  title={`${item.date.toLocaleDateString()}: ${item.count} items`}
                  className={`w-6 h-6 rounded-xs transition-all duration-150 flex items-center justify-center text-[8px] font-mono border ${
                    density.bgClass
                  } ${
                    isSelected ? 'ring-2 ring-white scale-125 z-10 shadow-lg' : ''
                  }`}
                >
                  {item.count > 0 ? item.count : ''}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-[#8E939E]">
            <span>JAN 01, {currentYear}</span>
            <span>DEC 31, {currentYear}</span>
          </div>
        </div>
      )}

      {/* --- SELECTED DAY INSPECTION DRAWER / LEDGER --- */}
      <div id="calendar-day-inspection" className="mt-12 pt-8 border-t border-[#232730]">
        <div className="bg-[#0F1219] border border-[#212735] rounded-xl p-6 shadow-2xl">
          
          {/* Day Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#1E232F] gap-4">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#CFA04E] uppercase mb-1 flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>DAY SPECIMEN DOSSIER · {selectedDayKey || 'NO DAY SELECTED'}</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#FAF8F5]">
                {formattedSelectedDate || 'Select a day to inspect'}
              </h2>
            </div>

            {selectedDayReceipts.length > 0 && (
              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="px-3 py-1.5 rounded bg-[#171B26] border border-[#252C3D]">
                  <span className="text-[#8E939E]">RECORDED TRACES: </span>
                  <span className="text-[#FAF8F5] font-bold">{selectedDayReceipts.length}</span>
                </div>
                {selectedDayTotalSpend > 0 && (
                  <div className="px-3 py-1.5 rounded bg-[#171B26] border border-[#252C3D]">
                    <span className="text-[#8E939E]">TOTAL SPEND: </span>
                    <span className="text-[#CFA04E] font-bold">£{selectedDayTotalSpend.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* If Day has No Traces */}
          {selectedDayReceipts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="font-editorial text-xl text-[#8E939E] mb-2">
                NO TRACES LOGGED ON THIS DATE
              </div>
              <p className="font-mono text-xs text-[#5A5E66] max-w-md mx-auto">
                A quiet temporal interval with zero captured transactions, audio streams, or archival field notes.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              
              {/* Day Narrative Summary */}
              <div className="bg-[#141722] border border-[#222938] p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#CFA04E]" />
                  <span className="text-[#FAF8F5]">
                    {selectedDayReceipts.length} physical artifacts inspected from this date
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[#8E939E]">
                  <span>CATEGORIES: {Array.from(new Set(selectedDayReceipts.map((r) => r.type))).join(' · ').toUpperCase()}</span>
                </div>
              </div>

              {/* Grid of Actual Physical Cards with Subtle Scale & Shadow on Hover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {selectedDayReceipts.map((receipt) => (
                  <ReceiptItem
                    key={receipt.id}
                    receipt={receipt}
                    isSelected={false}
                    isDimmed={false}
                    isConnected={false}
                    onSelect={onSelectReceipt}
                  />
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};
