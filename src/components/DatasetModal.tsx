import React, { useState } from 'react';
import { LifeReceipt, ProcessedArchive } from '../types';
import { 
  X, 
  UploadCloud, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Table as TableIcon,
  Layers,
  ShoppingBag,
  Music,
  FileSpreadsheet,
  Search
} from 'lucide-react';
import { SAMPLE_DATASET } from '../data/sampleDataset';

interface DatasetModalProps {
  archive: ProcessedArchive;
  onClose: () => void;
  onLoadNewData: (data: LifeReceipt[]) => void;
}

// Simple client-side CSV parser helper
function parseCsvToReceipts(csvText: string): LifeReceipt[] {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row.');
  }

  // Parse header
  const parseRow = (text: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  const receipts: LifeReceipt[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (values.length === 0 || !values.some(v => v.trim())) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });

    // Detect if this is Spotify or Household Transaction or Generic CSV
    const isSpotify = headers.some(h => h.includes('spotify') || h.includes('track') || h.includes('artist'));
    
    const timestampStr = rowObj.date || rowObj.timestamp || rowObj.played_at || rowObj.datetime || new Date().toISOString();
    const parsedDate = new Date(timestampStr);
    const validTimestamp = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

    if (isSpotify) {
      const trackName = rowObj.track_name || rowObj.track || rowObj.title || `Track #${i}`;
      const artist = rowObj.artist_name || rowObj.artist || 'Unknown Artist';
      const album = rowObj.album_name || rowObj.album || '';
      const valence = parseFloat(rowObj.valence || '0.5');
      const energy = parseFloat(rowObj.energy || '0.5');
      const durationMs = parseInt(rowObj.duration_ms || '210000', 10);

      receipts.push({
        id: `CSV-SPOTIFY-${String(i).padStart(3, '0')}`,
        type: 'music',
        timestamp: validTimestamp,
        title: trackName,
        subtitle: artist,
        description: album ? `Album: ${album}. Streamed audio receipt.` : `Streamed audio receipt from Spotify activity log.`,
        entities: [artist, album, trackName].filter(Boolean),
        metadata: {
          spotifyTrackId: rowObj.spotify_track_id || rowObj.track_id || `tr_${i}`,
          album,
          artist,
          valence: isNaN(valence) ? 0.5 : valence,
          energy: isNaN(energy) ? 0.5 : energy,
          danceability: parseFloat(rowObj.danceability || '0.5') || 0.5,
          durationSeconds: Math.round(durationMs / 1000),
          sourceDataset: 'spotify_data_dictionary',
        },
        source: 'Spotify Listening Log (CSV)',
      });
    } else {
      // Daily Household Transactions
      const title = rowObj.merchant || rowObj.title || rowObj.description || rowObj.subcategory || `Transaction #${i}`;
      const category = rowObj.category || 'purchases';
      const subcategory = rowObj.subcategory || rowObj.mode || rowObj.payment_mode || 'General';
      const amountVal = parseFloat(rowObj.amount || rowObj.cost || rowObj.price || '0');

      receipts.push({
        id: `CSV-TX-${String(i).padStart(3, '0')}`,
        type: 'purchases',
        timestamp: validTimestamp,
        title: title,
        subtitle: `${category} · ${subcategory}`,
        description: rowObj.note || rowObj.description || `Itemized household transaction receipt from ${title}.`,
        location: rowObj.location || rowObj.city ? {
          name: rowObj.location || title,
          city: rowObj.city || 'Home City',
        } : undefined,
        entities: [title, category, subcategory].filter(Boolean),
        metadata: {
          amount: isNaN(amountVal) ? 12.50 : amountVal,
          currency: rowObj.currency || 'USD',
          paymentMode: rowObj.mode || rowObj.payment_mode || 'Contactless',
          subcategory,
          sourceDataset: 'Daily Household Transactions',
        },
        source: 'Household Transactions (CSV)',
      });
    }
  }

  return receipts;
}

export const DatasetModal: React.FC<DatasetModalProps> = ({
  archive,
  onClose,
  onLoadNewData,
}) => {
  const [activeTab, setActiveTab] = useState<'INGEST' | 'TABLE'>('INGEST');
  const [rawInput, setRawInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState<string>('');

  // Built-in presets
  const householdPreset = SAMPLE_DATASET.filter(r => r.type === 'purchases');
  const spotifyPreset = SAMPLE_DATASET.filter(r => r.type === 'music' || r.type === 'searches');

  // Handle file upload (JSON or CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setErrorMsg(null);
        const text = event.target?.result as string;
        if (file.name.endsWith('.csv') || text.trim().startsWith('Date') || text.trim().startsWith('id,') || text.includes(',')) {
          // Attempt CSV parse
          const csvReceipts = parseCsvToReceipts(text);
          if (csvReceipts.length === 0) throw new Error('No valid records parsed from CSV.');
          onLoadNewData(csvReceipts);
          setSuccessMsg(`Successfully ingested ${csvReceipts.length} records from CSV (${file.name})!`);
        } else {
          // Attempt JSON parse
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) {
            throw new Error('Dataset must be a JSON array of LifeReceipt objects.');
          }
          onLoadNewData(parsed);
          setSuccessMsg(`Successfully ingested ${parsed.length} records from JSON (${file.name})!`);
        }
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error processing dataset file.');
      }
    };
    reader.readAsText(file);
  };

  // Handle manual input paste (JSON or CSV)
  const handleApplyRawInput = () => {
    try {
      setErrorMsg(null);
      const text = rawInput.trim();
      if (!text) return;

      if (text.startsWith('[') || text.startsWith('{')) {
        const parsed = JSON.parse(text);
        const arrayData = Array.isArray(parsed) ? parsed : [parsed];
        onLoadNewData(arrayData);
        setSuccessMsg(`Successfully ingested ${arrayData.length} records from pasted JSON!`);
      } else {
        const csvReceipts = parseCsvToReceipts(text);
        if (csvReceipts.length === 0) throw new Error('No valid records parsed from CSV text.');
        onLoadNewData(csvReceipts);
        setSuccessMsg(`Successfully ingested ${csvReceipts.length} records from pasted CSV!`);
      }
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Syntax error in pasted text.');
    }
  };

  // Preset switchers
  const handleLoadPreset = (presetType: 'ALL' | 'HOUSEHOLD' | 'SPOTIFY') => {
    if (presetType === 'ALL') {
      onLoadNewData(SAMPLE_DATASET);
      setSuccessMsg(`Loaded Combined Life Archive (${SAMPLE_DATASET.length} records).`);
    } else if (presetType === 'HOUSEHOLD') {
      onLoadNewData(householdPreset);
      setSuccessMsg(`Loaded Daily Household Transactions dataset (${householdPreset.length} records).`);
    } else if (presetType === 'SPOTIFY') {
      onLoadNewData(spotifyPreset);
      setSuccessMsg(`Loaded Spotify Data Dictionary dataset (${spotifyPreset.length} records).`);
    }
    setTimeout(() => onClose(), 1000);
  };

  // Export current dataset as JSON
  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archive.receipts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'traceri_digital_receipts_dataset.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export current dataset as CSV
  const handleDownloadCsv = () => {
    const headers = ['id', 'type', 'timestamp', 'title', 'subtitle', 'amount', 'source', 'description'];
    const csvRows = [headers.join(',')];

    archive.receipts.forEach(r => {
      const row = [
        `"${r.id}"`,
        `"${r.type}"`,
        `"${r.timestamp}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.subtitle || '').replace(/"/g, '""')}"`,
        `"${r.metadata?.amount || ''}"`,
        `"${(r.source || '').replace(/"/g, '""')}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'traceri_digital_receipts_dataset.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Filtered dataset for Table Inspector
  const tableData = archive.receipts.filter(r => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      (r.subtitle && r.subtitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0E1117] border border-[#232730] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-5 border-b border-[#232730] flex items-center justify-between bg-[#11141D]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#1C202B] border border-[#2B313F] text-[#CFA04E]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#CFA04E] uppercase tracking-widest flex items-center space-x-2">
                <span>DATASET INGESTION WORKBENCH</span>
                <span className="text-[#8E939E]">·</span>
                <span className="text-emerald-400">FAIE COMPLIANT</span>
              </div>
              <h3 className="font-editorial text-xl sm:text-2xl text-[#FAF8F5] mt-0.5">
                Datasets & Ingestion Engine
              </h3>
            </div>
          </div>

          {/* Tab Switcher & Close */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-[#181C26] p-1 rounded-lg border border-[#282F3E] text-xs font-mono">
              <button
                onClick={() => setActiveTab('INGEST')}
                className={`px-3 py-1 rounded transition-all flex items-center space-x-1.5 ${
                  activeTab === 'INGEST'
                    ? 'bg-[#CFA04E] text-[#0A0B0D] font-bold'
                    : 'text-[#8E939E] hover:text-[#FAF8F5]'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>INGEST & PRESETS</span>
              </button>
              <button
                onClick={() => setActiveTab('TABLE')}
                className={`px-3 py-1 rounded transition-all flex items-center space-x-1.5 ${
                  activeTab === 'TABLE'
                    ? 'bg-[#CFA04E] text-[#0A0B0D] font-bold'
                    : 'text-[#8E939E] hover:text-[#FAF8F5]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>INSPECTOR ({archive.receipts.length})</span>
              </button>
            </div>

            <button
              id="dataset-modal-close-btn"
              onClick={onClose}
              className="p-1.5 text-[#8E939E] hover:text-[#FAF8F5] rounded hover:bg-[#1C2028]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: INGEST & PRESETS */}
        {activeTab === 'INGEST' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
            
            {/* Status and Active Dataset Summary */}
            <div className="p-4 rounded-xl bg-[#141720] border border-[#242934] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-[#FAF8F5] font-semibold text-sm flex items-center space-x-2">
                  <span>ACTIVE DATASET: {archive.totalTraces} RECORDS</span>
                </div>
                <div className="text-[#8E939E] mt-0.5 text-[11px]">
                  Daily Household Transactions & Spotify Data Dictionary modeled
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="dataset-download-csv-btn"
                  onClick={handleDownloadCsv}
                  className="px-2.5 py-1.5 rounded bg-[#1C2028] border border-[#2A313E] text-[#FAF8F5] hover:bg-[#252C38] flex items-center space-x-1.5 text-xs"
                  title="Export active dataset to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EXPORT CSV</span>
                </button>
                <button
                  id="dataset-download-json-btn"
                  onClick={handleDownloadJson}
                  className="px-2.5 py-1.5 rounded bg-[#1C2028] border border-[#2A313E] text-[#FAF8F5] hover:bg-[#252C38] flex items-center space-x-1.5 text-xs"
                  title="Export active dataset to JSON"
                >
                  <Download className="w-3.5 h-3.5 text-[#CFA04E]" />
                  <span>EXPORT JSON</span>
                </button>
              </div>
            </div>

            {/* Feedback messages */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-green-950/40 border border-green-800 text-green-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* PRESET DATASET SELECTOR */}
            <div>
              <div className="text-[#8E939E] text-[11px] font-semibold tracking-wider uppercase mb-2 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#CFA04E]" />
                <span>INSTANT PRESET DATASETS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleLoadPreset('ALL')}
                  className="p-3 rounded-xl bg-[#12151E] border border-[#252C3B] hover:border-[#CFA04E] transition-all text-left group"
                >
                  <div className="flex items-center space-x-2 text-[#CFA04E] font-bold text-xs">
                    <Database className="w-3.5 h-3.5" />
                    <span>Combined Life Stream</span>
                  </div>
                  <div className="text-[11px] text-[#8E939E] mt-1">
                    Full synthesized archive ({SAMPLE_DATASET.length} records)
                  </div>
                </button>

                <button
                  onClick={() => handleLoadPreset('HOUSEHOLD')}
                  className="p-3 rounded-xl bg-[#12151E] border border-[#252C3B] hover:border-[#CFA04E] transition-all text-left group"
                >
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Household Transactions</span>
                  </div>
                  <div className="text-[11px] text-[#8E939E] mt-1">
                    Daily spending & merchants ({householdPreset.length} records)
                  </div>
                </button>

                <button
                  onClick={() => handleLoadPreset('SPOTIFY')}
                  className="p-3 rounded-xl bg-[#12151E] border border-[#252C3B] hover:border-[#CFA04E] transition-all text-left group"
                >
                  <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs">
                    <Music className="w-3.5 h-3.5" />
                    <span>Spotify Data Dictionary</span>
                  </div>
                  <div className="text-[11px] text-[#8E939E] mt-1">
                    Audio streams & valence receipts ({spotifyPreset.length} records)
                  </div>
                </button>
              </div>
            </div>

            {/* Drag & Drop File Ingestion Section (Supports CSV & JSON) */}
            <div className="border border-dashed border-[#2F3746] rounded-2xl p-6 text-center hover:border-[#CFA04E] transition-colors bg-[#11141C]">
              <UploadCloud className="w-8 h-8 text-[#CFA04E] mx-auto mb-2 opacity-80" />
              <div className="text-[#FAF8F5] font-semibold text-sm">
                Drop or Upload Dataset File (.CSV or .JSON)
              </div>
              <p className="text-[#8E939E] text-[11px] mt-1 max-w-md mx-auto">
                Supports <strong className="text-[#FAF8F5]">Daily Household Transactions.csv</strong> and <strong className="text-[#FAF8F5]">spotify_data_dictionary.csv</strong> or custom JSON arrays. The client-side parser standardizes schema automatically.
              </p>
              <label className="mt-4 inline-block px-5 py-2.5 rounded-lg bg-[#FAF8F5] text-[#0A0B0D] font-bold cursor-pointer hover:bg-[#EAE7E1] transition-colors shadow-md">
                <span>BROWSE FILE (.CSV / .JSON)</span>
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct Paste Section */}
            <div className="space-y-2">
              <div className="text-[#8E939E] flex items-center justify-between text-[11px]">
                <span>OR PASTE RAW CSV / JSON TEXT:</span>
                <span className="text-[10px] text-[#CFA04E]">AUTO-DETECTS CSV HEADERS OR JSON ARRAY</span>
              </div>
              <textarea
                id="dataset-raw-textarea"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder='Date, Category, Subcategory, Amount, Payment Mode, Merchant&#10;2025-04-01, Food, Groceries, 42.50, Contactless, Whole Foods Market'
                rows={4}
                className="w-full p-3 rounded-lg bg-[#12151D] border border-[#242934] text-xs font-mono text-[#FAF8F5] placeholder-[#444] focus:outline-none focus:border-[#CFA04E]"
              />
              <button
                id="dataset-apply-raw-btn"
                onClick={handleApplyRawInput}
                disabled={!rawInput.trim()}
                className="w-full py-2.5 rounded-lg bg-[#1C2028] border border-[#2A313E] text-[#FAF8F5] font-semibold disabled:opacity-30 hover:bg-[#252C38] hover:border-[#3A4252] transition-colors"
              >
                INGEST & PROCESS DATASET TEXT
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: RAW TABLE INSPECTOR */}
        {activeTab === 'TABLE' && (
          <div className="p-6 overflow-hidden flex flex-col flex-1 text-xs font-mono space-y-4">
            
            {/* Search Table */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8E939E]" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Filter raw records (e.g. TR-001, Solaris, Barbican, Coffee)..."
                  className="w-full pl-9 pr-3 py-2 bg-[#12151D] border border-[#242934] rounded-lg text-xs text-[#FAF8F5] focus:outline-none focus:border-[#CFA04E]"
                />
              </div>
              <div className="text-[#8E939E] text-[11px]">
                Showing {tableData.length} / {archive.receipts.length}
              </div>
            </div>

            {/* Spreadsheet Table */}
            <div className="flex-1 overflow-auto border border-[#232730] rounded-xl bg-[#0B0D12]">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead className="bg-[#141722] border-b border-[#232730] text-[#CFA04E] text-[10px] uppercase font-mono sticky top-0">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Title / Item</th>
                    <th className="p-2.5">Subtitle / Subcat</th>
                    <th className="p-2.5">Source Dataset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C202B] text-[#D8D5CE]">
                  {tableData.slice(0, 100).map((row) => (
                    <tr key={row.id} className="hover:bg-[#131620]">
                      <td className="p-2.5 font-bold text-[#FAF8F5]">{row.id}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#1C2230] text-[#CFA04E] text-[10px] font-semibold uppercase">
                          {row.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#8E939E] whitespace-nowrap">{row.timestamp.slice(0, 16).replace('T', ' ')}</td>
                      <td className="p-2.5 font-medium text-white max-w-[200px] truncate">{row.title}</td>
                      <td className="p-2.5 text-[#8E939E] max-w-[150px] truncate">{row.subtitle || '—'}</td>
                      <td className="p-2.5 text-[#8E939E] text-[10px]">{row.source || 'Local Trace'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#232730] bg-[#12141C] flex items-center justify-between text-[11px] font-mono text-[#8E939E]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FAIE AUTOMATED EVALUATION READY</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-[#FAF8F5] text-[#0A0B0D] font-bold hover:bg-[#EAE7E1]"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

