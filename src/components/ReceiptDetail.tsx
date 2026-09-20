import React, { useState } from 'react';
import { LifeReceipt, ProcessedArchive, Connection } from '../types';
import { CATEGORY_META } from '../utils/engine';
import { 
  X, 
  Compass, 
  MapPin, 
  Link as LinkIcon, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Printer,
  FileText,
  Check
} from 'lucide-react';

interface ReceiptDetailProps {
  receipt: LifeReceipt;
  archive: ProcessedArchive;
  onClose: () => void;
  onSelectReceipt: (receipt: LifeReceipt) => void;
  onFollowThread: (startReceiptId: string) => void;
}

export const ReceiptDetail: React.FC<ReceiptDetailProps> = ({
  receipt,
  archive,
  onClose,
  onSelectReceipt,
  onFollowThread,
}) => {
  const [isThermalMode, setIsThermalMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const cat = CATEGORY_META[receipt.type];
  const dateObj = new Date(receipt.timestamp);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Find all connections for this receipt
  const connectedConnections = archive.connections.filter(
    (c) => c.from === receipt.id || c.to === receipt.id
  );

  // Get connected receipt objects
  const connectedReceipts = connectedConnections.map((conn) => {
    const targetId = conn.from === receipt.id ? conn.to : conn.from;
    const targetReceipt = archive.receipts.find((r) => r.id === targetId);
    return {
      connection: conn,
      receipt: targetReceipt,
    };
  }).filter((item): item is { connection: Connection; receipt: LifeReceipt } => Boolean(item.receipt));

  // Find next and previous receipts
  const currentIndex = archive.receipts.findIndex((r) => r.id === receipt.id);
  const prevReceipt = currentIndex > 0 ? archive.receipts[currentIndex - 1] : null;
  const nextReceipt = currentIndex < archive.receipts.length - 1 ? archive.receipts[currentIndex + 1] : null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `TRACERI DIGITAL LIFE RECEIPT\nID: ${receipt.id}\nDATE: ${formattedDate} ${formattedTime}\nTITLE: ${receipt.title}\nCATEGORY: ${cat.label}\nAMOUNT/DETAILS: ${receipt.metadata.amount ? `$${receipt.metadata.amount}` : receipt.subtitle || 'Recorded'}\nSOURCE: ${receipt.source || 'Archive'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0D0F14] border-l border-[#242934] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out overflow-hidden">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#232730] bg-[#12141C]">
        <div className="flex items-center space-x-3">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: cat.color }}
          />
          <span className="font-mono text-xs font-semibold tracking-wider text-[#FAF8F5]">
            {receipt.id}
          </span>
          <span className="text-[#3A4252]">/</span>
          <span style={{ color: cat.color }} className="font-mono text-xs uppercase tracking-wider font-medium">
            {cat.label}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Thermal Mode Toggle */}
          <button
            onClick={() => setIsThermalMode(!isThermalMode)}
            className={`px-2.5 py-1 rounded text-xs font-mono flex items-center space-x-1.5 transition-all ${
              isThermalMode 
                ? 'bg-[#FAF8F5] text-[#0A0B0D] font-bold' 
                : 'bg-[#1A1E28] text-[#CFA04E] hover:bg-[#252C3B] border border-[#2B3242]'
            }`}
            title="Toggle Thermal Paper Receipt View"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isThermalMode ? 'STANDARD VIEW' : 'THERMAL RECEIPT'}</span>
          </button>

          {/* Prev/Next */}
          <button
            id="detail-prev-btn"
            disabled={!prevReceipt}
            onClick={() => prevReceipt && onSelectReceipt(prevReceipt)}
            className="p-1.5 text-[#8E939E] hover:text-[#FAF8F5] disabled:opacity-30 rounded hover:bg-[#1C2028]"
            title="Previous Trace"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="detail-next-btn"
            disabled={!nextReceipt}
            onClick={() => nextReceipt && onSelectReceipt(nextReceipt)}
            className="p-1.5 text-[#8E939E] hover:text-[#FAF8F5] disabled:opacity-30 rounded hover:bg-[#1C2028]"
            title="Next Trace"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-[#242934] mx-1" />
          <button
            id="detail-close-btn"
            onClick={onClose}
            className="p-1.5 text-[#8E939E] hover:text-[#FAF8F5] rounded hover:bg-[#1C2028]"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* THERMAL PAPER RECEIPT VIEW */}
        {isThermalMode ? (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] text-[#111] p-6 rounded-lg font-mono text-xs shadow-2xl relative border-t-8 border-dashed border-[#111]/20 selection:bg-[#111] selection:text-white">
              <div className="text-center pb-4 border-b-2 border-dashed border-[#111]/30">
                <div className="font-bold text-base tracking-widest uppercase">TRACERI ARCHIVE</div>
                <div className="text-[10px] text-[#444] mt-0.5">AUTHENTIC DIGITAL LIFE RECEIPT</div>
                <div className="text-[9px] text-[#666] mt-1 font-sans">{formattedDate} · {formattedTime}</div>
              </div>

              <div className="py-4 space-y-2 border-b-2 border-dashed border-[#111]/30">
                <div className="flex justify-between font-bold text-sm">
                  <span>ITEM / EVENT:</span>
                  <span className="text-right">{receipt.title}</span>
                </div>
                {receipt.subtitle && (
                  <div className="flex justify-between text-[#444]">
                    <span>SUBTITLE:</span>
                    <span>{receipt.subtitle}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#444]">
                  <span>CATEGORY:</span>
                  <span className="uppercase font-bold">{cat.label}</span>
                </div>
                <div className="flex justify-between text-[#444]">
                  <span>RECORD ID:</span>
                  <span>{receipt.id}</span>
                </div>
                {receipt.location && (
                  <div className="flex justify-between text-[#444]">
                    <span>LOCATION:</span>
                    <span>{receipt.location.name}, {receipt.location.city}</span>
                  </div>
                )}
              </div>

              <div className="py-4 space-y-1">
                <div className="flex justify-between text-[10px] text-[#666] font-bold border-b border-[#111]/20 pb-1 mb-2">
                  <span>QTY / METRIC</span>
                  <span>DESCRIPTION</span>
                  <span>VALUE</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>1x</span>
                  <span className="truncate max-w-[180px]">{receipt.title}</span>
                  <span>{receipt.metadata.amount ? `$${Number(receipt.metadata.amount).toFixed(2)}` : 'RECORDED'}</span>
                </div>
                {receipt.metadata.vat && (
                  <div className="flex justify-between text-[#555] text-[10px]">
                    <span>TAX / VAT</span>
                    <span>ESTIMATED VAT</span>
                    <span>${Number(receipt.metadata.vat).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t-2 border-dashed border-[#111]/30 space-y-3 text-center">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL VALUE:</span>
                  <span>{receipt.metadata.amount ? `$${Number(receipt.metadata.amount).toFixed(2)} USD` : 'NON-MONETARY LIFE TRACE'}</span>
                </div>

                <div className="pt-2 flex flex-col items-center">
                  <div className="h-8 w-full bg-[#111] flex items-center justify-center p-1 rounded-xs">
                    <div className="h-full w-full border-b-2 border-t-2 border-dashed border-white opacity-80" />
                  </div>
                  <div className="text-[9px] tracking-widest text-[#555] mt-1 font-mono">
                    * {receipt.id} - {receipt.timestamp.slice(0, 10)} *
                  </div>
                </div>

                <div className="text-[9px] text-[#777] italic pt-1">
                  Thank you for cataloging your temporal footsteps on Traceri.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded bg-[#FAF8F5] text-[#0A0B0D] font-bold hover:bg-[#EAE7E1] flex items-center space-x-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PRINT / PDF RECEIPT</span>
              </button>
              <button
                onClick={handleCopyText}
                className="px-4 py-2 rounded bg-[#1C2028] border border-[#2A313E] text-[#FAF8F5] hover:bg-[#252C38] flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED!' : 'COPY TEXT'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD ARCHIVAL VIEW */
          <>
            {/* Date & Time Heading */}
            <div className="border-b border-[#232730]/80 pb-4">
              <div className="font-mono text-xs text-[#8E939E] flex items-center space-x-2">
                <span>{formattedDate}</span>
                <span>·</span>
                <span className="text-[#FAF8F5] font-semibold">{formattedTime} UTC</span>
              </div>
              <h2 className="mt-3 font-editorial text-2xl sm:text-3xl font-normal text-[#FAF8F5] leading-tight">
                {receipt.title}
              </h2>
              {receipt.subtitle && (
                <p className="mt-1 font-sans text-sm text-[#8E939E]">
                  {receipt.subtitle}
                </p>
              )}
            </div>

            {/* Photo view if present */}
            {receipt.metadata.url && (
              <div className="rounded-lg overflow-hidden border border-[#2B313E] shadow-lg bg-[#07080A]">
                <img
                  src={receipt.metadata.url}
                  alt={receipt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover"
                />
                <div className="p-3 bg-[#11141A] flex items-center justify-between text-xs font-mono text-[#8E939E]">
                  <span>{receipt.metadata.camera || '35mm Camera'}</span>
                  <span>{receipt.metadata.aperture} · {receipt.metadata.shutter} · ISO {receipt.metadata.iso}</span>
                </div>
              </div>
            )}

            {/* Primary Description */}
            {receipt.description && (
              <div className="p-4 rounded bg-[#13161D] border border-[#242934]">
                <div className="text-[11px] font-mono text-[#8E939E] uppercase tracking-wider mb-1">
                  OBSERVATION & RECORD
                </div>
                <p className="font-sans text-sm text-[#E4E1DB] leading-relaxed">
                  {receipt.description}
                </p>
              </div>
            )}

            {/* Location metadata if available */}
            {receipt.location && (
              <div className="p-4 rounded bg-[#111614] border border-[#21352A] flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-mono text-[#76B896] uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>SPATIAL COORDINATE</span>
                  </div>
                  <div className="text-sm font-semibold text-[#FAF8F5]">
                    {receipt.location.name}
                  </div>
                  <div className="text-xs text-[#8E939E] mt-0.5">
                    {receipt.location.city}{receipt.location.country ? `, ${receipt.location.country}` : ''}
                  </div>
                </div>
                {receipt.location.coordinates && (
                  <div className="text-right font-mono text-xs text-[#76B896]">
                    <div>{receipt.location.coordinates[0].toFixed(4)}° N</div>
                    <div>{receipt.location.coordinates[1].toFixed(4)}° E</div>
                  </div>
                )}
              </div>
            )}

            {/* Entities Tag Cloud */}
            {receipt.entities.length > 0 && (
              <div>
                <div className="text-[11px] font-mono text-[#8E939E] uppercase tracking-wider mb-2">
                  EXTRACTED ENTITIES
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {receipt.entities.map((ent, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-[#1A1E26] border border-[#2A313E] text-xs font-mono text-[#E4E1DB]"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Metadata Attributes */}
            {Object.keys(receipt.metadata).length > 0 && (
              <div className="border-t border-[#232730] pt-4">
                <div className="text-[11px] font-mono text-[#8E939E] uppercase tracking-wider mb-3">
                  METADATA RECORD
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(receipt.metadata).map(([key, value]) => {
                    if (key === 'url') return null;
                    return (
                      <div key={key} className="p-2 rounded bg-[#13161C] border border-[#242934]">
                        <div className="text-[10px] text-[#8E939E] uppercase truncate">{key}</div>
                        <div className="text-[#FAF8F5] font-semibold truncate mt-0.5">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONNECTED TRACES SECTION */}
            <div className="border-t border-[#232730] pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-3.5 h-3.5 text-[#569CA6]" />
                  <span className="text-xs font-mono font-semibold tracking-wider text-[#FAF8F5]">
                    CONNECTED TRACES ({connectedReceipts.length})
                  </span>
                </div>
                {connectedReceipts.length > 0 && (
                  <button
                    id="detail-follow-thread-btn"
                    onClick={() => onFollowThread(receipt.id)}
                    className="text-xs font-mono text-[#CFA04E] hover:underline flex items-center space-x-1"
                  >
                    <span>FOLLOW THREAD</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {connectedReceipts.length === 0 ? (
                <p className="text-xs font-mono text-[#8E939E] italic">
                  Isolated moment. No immediate temporal or semantic proximity detected.
                </p>
              ) : (
                <div className="space-y-2">
                  {connectedReceipts.map(({ connection, receipt: target }) => {
                    const targetCat = CATEGORY_META[target.type];
                    return (
                      <div
                        key={connection.id}
                        onClick={() => onSelectReceipt(target)}
                        className="p-3 rounded bg-[#141720] border border-[#242934] hover:border-[#3A4252] cursor-pointer transition-all hover:translate-x-1 flex items-start justify-between group"
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center space-x-2 text-[10px] font-mono mb-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: targetCat.color }}
                            />
                            <span style={{ color: targetCat.color }} className="font-semibold uppercase">
                              {targetCat.label}
                            </span>
                            <span className="text-[#8E939E]">·</span>
                            <span className="text-[#8E939E]">{target.id}</span>
                            <span className="text-[#8E939E]">·</span>
                            <span className="text-[#CFA04E] font-medium">{connection.evidence}</span>
                          </div>
                          <div className="text-xs font-medium text-[#FAF8F5] group-hover:text-[#CFA04E] transition-colors truncate">
                            {target.title}
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#8E939E] group-hover:text-[#FAF8F5] mt-1 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-4 border-t border-[#232730] bg-[#12141C] flex items-center justify-between">
        <span className="font-mono text-xs text-[#8E939E]">
          SOURCE: {receipt.source || 'LOCAL TRACE'}
        </span>
        <button
          id="detail-follow-btn-bottom"
          onClick={() => onFollowThread(receipt.id)}
          className="px-4 py-2 rounded bg-[#CFA04E] text-[#0A0B0D] font-mono text-xs font-semibold hover:bg-[#DFB367] transition-all flex items-center space-x-1.5"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>FOLLOW THREAD</span>
        </button>
      </div>

    </div>
  );
};

