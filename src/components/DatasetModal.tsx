import React, { useState } from 'react';
import { LifeReceipt, ProcessedArchive } from '../types';
import { X, UploadCloud, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { SAMPLE_DATASET } from '../data/sampleDataset';

interface DatasetModalProps {
  archive: ProcessedArchive;
  onClose: () => void;
  onLoadNewData: (data: LifeReceipt[]) => void;
}

export const DatasetModal: React.FC<DatasetModalProps> = ({
  archive,
  onClose,
  onLoadNewData,
}) => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('Dataset must be a JSON array of LifeReceipt objects.');
        }
        onLoadNewData(parsed);
        setSuccessMsg(`Successfully ingested ${parsed.length} records!`);
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        setErrorMsg(err.message || 'Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Handle manual JSON paste
  const handleApplyJson = () => {
    try {
      setErrorMsg(null);
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('Dataset must be a JSON array of LifeReceipt objects.');
      }
      onLoadNewData(parsed);
      setSuccessMsg(`Successfully ingested ${parsed.length} custom records!`);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Syntax error in pasted JSON.');
    }
  };

  // Download current dataset
  const handleDownloadDataset = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archive.receipts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'trace_digital_life_dataset.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Reset to default
  const handleResetDefault = () => {
    onLoadNewData(SAMPLE_DATASET);
    setSuccessMsg('Reset to default curated dataset.');
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0E1117] border border-[#232730] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-6 border-b border-[#232730] flex items-center justify-between">
          <div>
            <div className="font-mono text-xs text-[#CFA04E] uppercase tracking-widest">
              LOCAL ARCHIVE INGESTION
            </div>
            <h3 className="font-editorial text-2xl text-[#FAF8F5] mt-0.5">
              Dataset & Ingestion Engine
            </h3>
          </div>
          <button
            id="dataset-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-[#8E939E] hover:text-[#FAF8F5] rounded hover:bg-[#1C2028]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
          
          {/* Status and summary */}
          <div className="p-4 rounded-lg bg-[#141720] border border-[#242934] flex items-center justify-between">
            <div>
              <div className="text-[#FAF8F5] font-semibold">
                ACTIVE DATASET: {archive.totalTraces} RECORDS
              </div>
              <div className="text-[#8E939E] mt-0.5">
                Vol. 01 · 8 Categories · {archive.threads.length} Discovered Threads
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                id="dataset-download-btn"
                onClick={handleDownloadDataset}
                className="px-3 py-1.5 rounded bg-[#1C2028] border border-[#2A313E] text-[#FAF8F5] hover:bg-[#252C38] flex items-center space-x-1"
                title="Download JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT</span>
              </button>
              <button
                id="dataset-reset-btn"
                onClick={handleResetDefault}
                className="px-3 py-1.5 rounded bg-[#1C2028] border border-[#2A313E] text-[#8E939E] hover:text-[#FAF8F5] flex items-center space-x-1"
                title="Reset to sample dataset"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded bg-red-950/40 border border-red-800 text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded bg-green-950/40 border border-green-800 text-green-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Upload File Section */}
          <div className="border border-dashed border-[#2F3746] rounded-xl p-6 text-center hover:border-[#CFA04E] transition-colors bg-[#11141C]">
            <UploadCloud className="w-8 h-8 text-[#CFA04E] mx-auto mb-2 opacity-80" />
            <div className="text-[#FAF8F5] font-semibold text-sm">
              Drop or Upload a JSON Dataset File
            </div>
            <p className="text-[#8E939E] text-[11px] mt-1 max-w-sm mx-auto">
              Any dataset conforming to the LifeReceipt schema. The frontend automatically normalizes dates,
              detects entities, clusters moments, and generates chapters.
            </p>
            <label className="mt-4 inline-block px-4 py-2 rounded bg-[#FAF8F5] text-[#0A0B0D] font-bold cursor-pointer hover:bg-[#EAE7E1] transition-colors">
              <span>SELECT FILE (.JSON)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Direct Paste Section */}
          <div className="space-y-2">
            <div className="text-[#8E939E] flex items-center justify-between">
              <span>OR PASTE RAW JSON ARRAY:</span>
              <span className="text-[10px] text-[#CFA04E]">FORMAT: [ {"{ id, type, timestamp, title, ... }"} ]</span>
            </div>
            <textarea
              id="dataset-json-textarea"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[ { "id": "TR-099", "type": "music", "timestamp": "2025-04-01T12:00:00Z", "title": "Track Title", "entities": ["Artist"] } ]'
              rows={5}
              className="w-full p-3 rounded bg-[#12151D] border border-[#242934] text-xs font-mono text-[#FAF8F5] placeholder-[#444] focus:outline-none focus:border-[#CFA04E]"
            />
            <button
              id="dataset-apply-json-btn"
              onClick={handleApplyJson}
              disabled={!jsonInput.trim()}
              className="w-full py-2 rounded bg-[#1C2028] border border-[#2A313E] text-[#FAF8F5] font-semibold disabled:opacity-30 hover:bg-[#252C38] hover:border-[#3A4252] transition-colors"
            >
              INGEST & PROCESS DATASET
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232730] bg-[#12141C] flex items-center justify-between text-[11px] font-mono text-[#8E939E]">
          <span>FRONTEND DETERMINISTIC ENGINE ONLY</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#FAF8F5] text-[#0A0B0D] font-bold hover:bg-[#EAE7E1]"
          >
            DONE
          </button>
        </div>

      </div>
    </div>
  );
};
