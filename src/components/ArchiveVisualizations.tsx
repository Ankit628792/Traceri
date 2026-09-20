import React, { useState, useMemo } from 'react';
import { ProcessedArchive, TraceCategory } from '../types';
import { CATEGORIES, CATEGORY_META } from '../utils/engine';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { BarChart3, Clock, DollarSign, Activity } from 'lucide-react';

interface ArchiveVisualizationsProps {
  archive: ProcessedArchive;
}

type VisualizationTab = 'frequency' | 'spend' | 'temporal' | 'overview';

export const ArchiveVisualizations: React.FC<ArchiveVisualizationsProps> = React.memo(({ archive }) => {
  const [activeTab, setActiveTab] = useState<VisualizationTab>('overview');

  // 1. Category Frequency & Distribution
  const frequencyData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const count = archive.receipts.filter((r) => r.type === cat).length;
      const percentage = archive.receipts.length > 0
        ? Math.round((count / archive.receipts.length) * 100)
        : 0;
      const meta = CATEGORY_META[cat];
      return {
        category: cat,
        label: meta.label,
        count,
        percentage,
        color: meta.color,
      };
    }).sort((a, b) => b.count - a.count);
  }, [archive.receipts]);

  // 2. Spend breakdown by category (Purchases, Events, Places, etc.)
  const spendAnalysis = useMemo(() => {
    const spendByCategory: Record<string, { total: number; count: number; currency: string }> = {};
    let totalSpend = 0;
    let transactionCount = 0;
    let maxTransaction = { amount: 0, title: '', category: '' };

    archive.receipts.forEach((r) => {
      if (r.metadata.amount && typeof r.metadata.amount === 'number') {
        const amount = r.metadata.amount;
        const cat = r.type;
        const cur = r.metadata.currency || 'GBP';

        if (!spendByCategory[cat]) {
          spendByCategory[cat] = { total: 0, count: 0, currency: cur };
        }
        spendByCategory[cat].total += amount;
        spendByCategory[cat].count += 1;
        totalSpend += amount;
        transactionCount += 1;

        if (amount > maxTransaction.amount) {
          maxTransaction = { amount, title: r.title, category: cat };
        }
      }
    });

    const chartData = Object.entries(spendByCategory).map(([cat, data]) => {
      const meta = CATEGORY_META[cat as TraceCategory] || { label: cat.toUpperCase(), color: '#CFA04E' };
      return {
        category: cat,
        label: meta.label,
        amount: Math.round(data.total * 100) / 100,
        count: data.count,
        currency: data.currency,
        color: meta.color,
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      chartData,
      totalSpend: Math.round(totalSpend * 100) / 100,
      transactionCount,
      averageSpend: transactionCount > 0 ? Math.round((totalSpend / transactionCount) * 100) / 100 : 0,
      maxTransaction,
    };
  }, [archive.receipts]);

  // 3. Temporal Distribution by Hour of the Day (00 to 23)
  const diurnalData = useMemo(() => {
    const hours: { hour: string; hourNum: number; count: number; notes: number; purchases: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const hourStr = `${String(h).padStart(2, '0')}:00`;
      hours.push({ hour: hourStr, hourNum: h, count: 0, notes: 0, purchases: 0 });
    }

    archive.receipts.forEach((r) => {
      const d = new Date(r.timestamp);
      const h = d.getHours();
      if (hours[h]) {
        hours[h].count += 1;
        if (r.type === 'notes') hours[h].notes += 1;
        if (r.type === 'purchases') hours[h].purchases += 1;
      }
    });

    return hours;
  }, [archive.receipts]);

  // Diurnal Periods (Morning, Afternoon, Evening, Night)
  const diurnalPeriods = useMemo(() => {
    let morning = 0; // 06:00 - 11:59
    let afternoon = 0; // 12:00 - 17:59
    let evening = 0; // 18:00 - 22:59
    let night = 0; // 23:00 - 05:59

    archive.receipts.forEach((r) => {
      const h = new Date(r.timestamp).getHours();
      if (h >= 6 && h < 12) morning++;
      else if (h >= 12 && h < 18) afternoon++;
      else if (h >= 18 && h < 23) evening++;
      else night++;
    });

    const total = archive.receipts.length || 1;
    return [
      { name: 'Morning (06:00 - 12:00)', count: morning, pct: Math.round((morning / total) * 100), color: '#E07A5F' },
      { name: 'Afternoon (12:00 - 18:00)', count: afternoon, pct: Math.round((afternoon / total) * 100), color: '#CFA04E' },
      { name: 'Evening (18:00 - 23:00)', count: evening, pct: Math.round((evening / total) * 100), color: '#8B78C2' },
      { name: 'Night (23:00 - 06:00)', count: night, pct: Math.round((night / total) * 100), color: '#569CA6' },
    ];
  }, [archive.receipts]);

  // Custom Editorial Tooltip for Recharts
  const CustomEditorialTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#12151E] border border-[#2B3242] p-3 rounded shadow-2xl font-mono text-xs z-50">
          <div className="text-[#CFA04E] font-bold tracking-wider mb-1 flex items-center space-x-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: data.color || '#CFA04E' }}
            />
            <span className="uppercase">{data.label || label || data.hour || data.name}</span>
          </div>
          <div className="text-[#FAF8F5] space-y-0.5">
            {data.count !== undefined && (
              <div className="flex justify-between space-x-4">
                <span className="text-[#8E939E]">Logged Events:</span>
                <span className="font-semibold">{data.count} items</span>
              </div>
            )}
            {data.percentage !== undefined && (
              <div className="flex justify-between space-x-4">
                <span className="text-[#8E939E]">Share of Total:</span>
                <span>{data.percentage}%</span>
              </div>
            )}
            {data.amount !== undefined && (
              <div className="flex justify-between space-x-4 text-[#CFA04E]">
                <span className="text-[#8E939E]">Recorded Spend:</span>
                <span className="font-bold">£{data.amount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="archive-visualizations" className="my-12 border-t border-b border-[#232730] py-10 bg-[#0C0E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Editorial Meta */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1E232F] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest text-[#CFA04E] uppercase mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>EDITORIAL DATA SYNTHESIS · RECHARTS METRICS</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#FAF8F5] font-normal tracking-wide">
              Category Distribution & Temporal Rhythms
            </h2>
            <p className="text-xs font-mono text-[#8E939E] mt-1">
              Quantitative breakdown of {archive.totalTraces} digitized artifacts across expenditure, frequency, and time.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-1.5 p-1 bg-[#141822] border border-[#232B3B] rounded-lg text-xs font-mono">
            <button
              id="viz-tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                activeTab === 'overview'
                  ? 'bg-[#FAF8F5] text-[#0A0B0D] font-bold'
                  : 'text-[#8E939E] hover:text-[#FAF8F5]'
              }`}
            >
              <span>OVERVIEW</span>
            </button>
            <button
              id="viz-tab-frequency"
              onClick={() => setActiveTab('frequency')}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                activeTab === 'frequency'
                  ? 'bg-[#CFA04E] text-[#0A0B0D] font-bold'
                  : 'text-[#8E939E] hover:text-[#FAF8F5]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>FREQUENCY</span>
            </button>
            <button
              id="viz-tab-spend"
              onClick={() => setActiveTab('spend')}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                activeTab === 'spend'
                  ? 'bg-[#CFA04E] text-[#0A0B0D] font-bold'
                  : 'text-[#8E939E] hover:text-[#FAF8F5]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>EXPENDITURE</span>
            </button>
            <button
              id="viz-tab-temporal"
              onClick={() => setActiveTab('temporal')}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                activeTab === 'temporal'
                  ? 'bg-[#CFA04E] text-[#0A0B0D] font-bold'
                  : 'text-[#8E939E] hover:text-[#FAF8F5]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>HOURLY RHYTHM</span>
            </button>
          </div>
        </div>

        {/* High-Level Stat Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#12151E] border border-[#202634] p-4 rounded-lg">
            <span className="text-[10px] font-mono text-[#8E939E] uppercase tracking-wider block">TOTAL DOCUMENTED TRACES</span>
            <span className="text-2xl font-editorial text-[#FAF8F5] font-semibold mt-1 block">{archive.totalTraces}</span>
            <span className="text-[10px] font-mono text-[#569CA6] mt-0.5 block">Across 9 life archetypes</span>
          </div>
          <div className="bg-[#12151E] border border-[#202634] p-4 rounded-lg">
            <span className="text-[10px] font-mono text-[#8E939E] uppercase tracking-wider block">RECORDED EXPENDITURE</span>
            <span className="text-2xl font-mono text-[#CFA04E] font-bold mt-1 block">£{spendAnalysis.totalSpend.toFixed(2)}</span>
            <span className="text-[10px] font-mono text-[#8E939E] mt-0.5 block">{spendAnalysis.transactionCount} financial receipts</span>
          </div>
          <div className="bg-[#12151E] border border-[#202634] p-4 rounded-lg">
            <span className="text-[10px] font-mono text-[#8E939E] uppercase tracking-wider block">AVG TRANSACTION VALUE</span>
            <span className="text-2xl font-mono text-[#FAF8F5] font-medium mt-1 block">£{spendAnalysis.averageSpend.toFixed(2)}</span>
            <span className="text-[10px] font-mono text-[#8E939E] mt-0.5 block">Peak: £{spendAnalysis.maxTransaction.amount.toFixed(2)}</span>
          </div>
          <div className="bg-[#12151E] border border-[#202634] p-4 rounded-lg">
            <span className="text-[10px] font-mono text-[#8E939E] uppercase tracking-wider block">PEAK DIURNAL WINDOW</span>
            <span className="text-2xl font-editorial text-[#FAF8F5] font-semibold mt-1 block">
              {diurnalPeriods.reduce((prev, cur) => cur.count > prev.count ? cur : prev).name.split(' ')[0]}
            </span>
            <span className="text-[10px] font-mono text-[#E07A5F] mt-0.5 block">
              {diurnalPeriods.reduce((prev, cur) => cur.count > prev.count ? cur : prev).pct}% of all memory timestamps
            </span>
          </div>
        </div>

        {/* --- VIEW: OVERVIEW (Dual Grid with Frequency + Spend + Diurnal) --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Category Volume Distribution */}
            <div className="bg-[#12151E] border border-[#202634] p-6 rounded-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1E232F]">
                <div>
                  <h3 className="font-editorial text-lg text-[#FAF8F5]">Category Volume & Frequency</h3>
                  <p className="text-[11px] font-mono text-[#8E939E]">Distribution of items across 9 archival domains</p>
                </div>
                <span className="text-[11px] font-mono text-[#CFA04E]">{frequencyData.length} Categories</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2533" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: '#8E939E', fontSize: 10, fontFamily: 'monospace' }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fill: '#8E939E', fontSize: 10, fontFamily: 'monospace' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomEditorialTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {frequencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E232F] flex flex-wrap gap-2 text-[10px] font-mono">
                {frequencyData.slice(0, 5).map((f) => (
                  <span key={f.category} className="px-2 py-0.5 rounded bg-[#171B26] border border-[#252C3D] flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="text-[#FAF8F5]">{f.label}:</span>
                    <span className="text-[#8E939E] font-bold">{f.count} ({f.percentage}%)</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Chart 2: Expenditure by Category Donut */}
            <div className="bg-[#12151E] border border-[#202634] p-6 rounded-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1E232F]">
                <div>
                  <h3 className="font-editorial text-lg text-[#FAF8F5]">Financial Expenditure Allocation</h3>
                  <p className="text-[11px] font-mono text-[#8E939E]">Cumulative recorded costs across transaction classes</p>
                </div>
                <span className="text-[11px] font-mono text-[#CFA04E]">£{spendAnalysis.totalSpend.toFixed(2)} Total</span>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomEditorialTooltip />} />
                    <Pie
                      data={spendAnalysis.chartData}
                      dataKey="amount"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {spendAnalysis.chartData.map((entry, index) => (
                        <Cell key={`spend-pie-${index}`} fill={entry.color} stroke="#12151E" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E232F] grid grid-cols-2 gap-2 text-[11px] font-mono">
                {spendAnalysis.chartData.map((s) => (
                  <div key={s.category} className="flex items-center justify-between px-2.5 py-1 rounded bg-[#171B26] border border-[#252C3D]">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-[#FAF8F5] truncate">{s.label}</span>
                    </div>
                    <span className="text-[#CFA04E] font-bold">£{s.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW: FREQUENCY ONLY (Full Detailed View) --- */}
        {activeTab === 'frequency' && (
          <div className="bg-[#12151E] border border-[#202634] p-6 rounded-lg">
            <div className="mb-6 flex justify-between items-center pb-3 border-b border-[#1E232F]">
              <div>
                <h3 className="font-editorial text-xl text-[#FAF8F5]">Archival Trace Frequency Analysis</h3>
                <p className="text-xs font-mono text-[#8E939E] mt-1">Exact counts and proportion of each activity category logged in memory.</p>
              </div>
              <span className="font-mono text-xs text-[#CFA04E]">{archive.totalTraces} Total Items</span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2533" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#8E939E', fontSize: 11, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    tick={{ fill: '#8E939E', fontSize: 11, fontFamily: 'monospace' }} 
                  />
                  <Tooltip content={<CustomEditorialTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {frequencyData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1E232F] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs font-mono">
              {frequencyData.map((f) => (
                <div key={f.category} className="p-3 bg-[#171B26] border border-[#252C3D] rounded">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="text-[#8E939E] text-[10px] uppercase font-bold">{f.label}</span>
                  </div>
                  <div className="text-lg font-editorial text-[#FAF8F5]">{f.count}</div>
                  <div className="text-[10px] text-[#569CA6]">{f.percentage}% of archive</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: EXPENDITURE ONLY (Deep Financial View) --- */}
        {activeTab === 'spend' && (
          <div className="bg-[#12151E] border border-[#202634] p-6 rounded-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E232F] gap-2">
              <div>
                <h3 className="font-editorial text-xl text-[#FAF8F5]">Financial Expenditure Distribution</h3>
                <p className="text-xs font-mono text-[#8E939E] mt-1">
                  Total logged payments and transaction sizes across categories.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-[#8E939E]">Cumulative Total: </span>
                <span className="text-xl font-mono text-[#CFA04E] font-bold">£{spendAnalysis.totalSpend.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendAnalysis.chartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2533" horizontal={false} />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#8E939E', fontSize: 10, fontFamily: 'monospace' }}
                      unit="£"
                    />
                    <YAxis 
                      dataKey="label" 
                      type="category" 
                      tick={{ fill: '#FAF8F5', fontSize: 11, fontFamily: 'monospace' }}
                    />
                    <Tooltip content={<CustomEditorialTooltip />} />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                      {spendAnalysis.chartData.map((entry, index) => (
                        <Cell key={`bar-spend-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#161A24] border border-[#232B3B]">
                  <span className="text-[10px] font-mono text-[#8E939E] uppercase tracking-wider block">PEAK ACQUISITION / EXPENSE</span>
                  <div className="text-base font-editorial text-[#FAF8F5] mt-1 truncate">
                    {spendAnalysis.maxTransaction.title || 'N/A'}
                  </div>
                  <div className="text-xl font-mono text-[#CFA04E] font-bold mt-1">
                    £{spendAnalysis.maxTransaction.amount.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-mono text-[#8E939E] uppercase">
                    Category: {spendAnalysis.maxTransaction.category}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[#161A24] border border-[#232B3B]">
                  <span className="text-[10px] font-mono text-[#8E939E] uppercase tracking-wider block">TRANSACTION FREQUENCY</span>
                  <div className="text-base font-editorial text-[#FAF8F5] mt-1">
                    {spendAnalysis.transactionCount} Paid Items Logged
                  </div>
                  <div className="text-xs font-mono text-[#8E939E] mt-1">
                    Average Cost per Receipt: <span className="text-[#FAF8F5] font-semibold">£{spendAnalysis.averageSpend.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: HOURLY / TEMPORAL RHYTHM --- */}
        {activeTab === 'temporal' && (
          <div className="bg-[#12151E] border border-[#202634] p-6 rounded-lg space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#1E232F]">
              <div>
                <h3 className="font-editorial text-xl text-[#FAF8F5]">Diurnal & Hourly Activity Rhythm</h3>
                <p className="text-xs font-mono text-[#8E939E] mt-1">
                  At what hours of the 24-hour cycle were digital traces and notes recorded?
                </p>
              </div>
              <span className="text-xs font-mono text-[#CFA04E]">24-Hour Cycle Analysis</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={diurnalData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CFA04E" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#CFA04E" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2533" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: '#8E939E', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    tick={{ fill: '#8E939E', fontSize: 10, fontFamily: 'monospace' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomEditorialTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#CFA04E" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#hourGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Diurnal Summary Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {diurnalPeriods.map((period, idx) => (
                <div key={idx} className="p-4 bg-[#161A24] border border-[#232B3B] rounded-lg">
                  <div className="flex items-center space-x-1.5 text-xs font-mono mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: period.color }} />
                    <span className="text-[#FAF8F5] font-semibold">{period.name.split(' ')[0]}</span>
                  </div>
                  <div className="text-2xl font-editorial text-[#FAF8F5]">{period.count} traces</div>
                  <div className="text-[10px] font-mono text-[#8E939E] mt-0.5">{period.pct}% of all life events</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
});
