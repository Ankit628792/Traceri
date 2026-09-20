import React from 'react';
import { LifeReceipt } from '../types';
import { CATEGORY_META } from '../utils/engine';
import { 
  Radio, 
  Film, 
  Compass, 
  Receipt, 
  Camera, 
  MessageSquare, 
  Search, 
  Calendar, 
  FileText,
  MapPin
} from 'lucide-react';

interface ReceiptItemProps {
  receipt: LifeReceipt;
  isSelected: boolean;
  isDimmed: boolean;
  isConnected: boolean;
  onSelect: (receipt: LifeReceipt) => void;
  onHover?: (receipt: LifeReceipt | null) => void;
}

export const ReceiptItem: React.FC<ReceiptItemProps> = ({
  receipt,
  isSelected,
  isDimmed,
  isConnected,
  onSelect,
  onHover,
}) => {
  const cat = CATEGORY_META[receipt.type];
  const dateStr = new Date(receipt.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = new Date(receipt.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const getIcon = () => {
    switch (receipt.type) {
      case 'music': return <Radio className="w-3.5 h-3.5" />;
      case 'movies': return <Film className="w-3.5 h-3.5" />;
      case 'places': return <Compass className="w-3.5 h-3.5" />;
      case 'purchases': return <Receipt className="w-3.5 h-3.5" />;
      case 'photos': return <Camera className="w-3.5 h-3.5" />;
      case 'messages': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'searches': return <Search className="w-3.5 h-3.5" />;
      case 'events': return <Calendar className="w-3.5 h-3.5" />;
      case 'notes': return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      id={`receipt-${receipt.id}`}
      data-cursor-label={cat.label.toUpperCase()}
      onClick={() => onSelect(receipt)}
      onMouseEnter={() => onHover?.(receipt)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative cursor-pointer select-none transition-all duration-150 ease-out ${
        isDimmed
          ? 'opacity-25'
          : 'opacity-100 hover:-translate-y-0.5'
      } ${
        isSelected
          ? 'ring-1 ring-[#CFA04E] shadow-lg z-20'
          : isConnected
          ? 'ring-1 ring-[#569CA6]/80 shadow-md z-10'
          : 'shadow-sm hover:shadow-md'
      }`}
    >
      {/* Category Pip & ID Indicator */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#8E939E] mb-1 px-1">
        <span className="flex items-center space-x-1">
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: cat.color }}
          />
          <span style={{ color: cat.color }} className="font-semibold tracking-wider">
            {cat.label}
          </span>
        </span>
        <span className="opacity-70">{receipt.id}</span>
      </div>

      {/* --- PHYSICAL OBJECT REPRESENTATIONS BY CATEGORY --- */}

      {/* 1. PURCHASES: Thermal Paper Receipt with jagged serrated tears & barcode */}
      {receipt.type === 'purchases' && (
        <div className="bg-[#151922] border border-[#2B3342] group-hover:border-[#3D475C] rounded-t p-3.5 font-mono text-xs shadow-sm transition-colors duration-150 relative overflow-hidden">
          {/* Subtle receipt crease / fold shadow */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />

          {/* Serrated top decorative edge */}
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-dashed border-[#2D3648] text-center">
            <div className="w-full">
              <div className="text-[9px] tracking-widest text-[#8E939E] uppercase">*** TRANSACTION RECORD ***</div>
              <div className="font-bold text-[#FAF8F5] tracking-wider text-xs truncate mt-0.5">
                {receipt.subtitle || 'MERCHANT TERMINAL'}
              </div>
              <div className="text-[9px] text-[#6B7280] mt-0.5">
                TERM ID: 884-LDN · {dateStr} {timeStr}
              </div>
            </div>
          </div>

          <div className="py-1.5 space-y-2">
            <div className="text-[#FAF8F5] font-medium text-xs leading-snug">
              {receipt.title}
            </div>

            {receipt.metadata.amount && (
              <div className="border-t border-b border-dashed border-[#2D3648] py-1.5 flex items-baseline justify-between">
                <span className="text-[10px] text-[#8E939E]">TOTAL BALANCE</span>
                <span className="text-sm font-bold text-[#CFA04E] font-mono">
                  {receipt.metadata.currency === 'GBP' ? '£' : receipt.metadata.currency === 'JPY' ? '¥' : '$'}
                  {receipt.metadata.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Authentic Barcode graphic */}
            <div className="pt-1 text-center">
              <div className="h-6 flex items-center justify-center space-x-0.5 opacity-60 group-hover:opacity-90 transition-opacity">
                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3].map((w, i) => (
                  <span
                    key={i}
                    className="bg-[#FAF8F5] h-full inline-block"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <div className="text-[8px] font-mono tracking-widest text-[#6B7280] mt-0.5">
                * {receipt.id} - 2024 *
              </div>
            </div>
          </div>

          {/* Serrated tear line bottom cutouts */}
          <div className="h-2 w-full flex space-x-1 justify-center mt-2 opacity-50">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 bg-[#07080A] rounded-full inline-block -mb-1" />
            ))}
          </div>
        </div>
      )}

      {/* 2. MUSIC: 12" Vinyl Record Sleeve with Concentric Grooves */}
      {receipt.type === 'music' && (
        <div className="bg-[#13131A] border border-[#2B293D] group-hover:border-[#3E3A54] rounded-lg p-3.5 shadow-sm transition-colors duration-150 relative overflow-hidden">
          {/* Circular Vinyl disc impression */}
          <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full border-4 border-[#1F1D2B] bg-[#0E0D14] flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
            <div className="w-20 h-20 rounded-full border border-dashed border-[#3D3854] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#8B78C2]/30 border border-[#8B78C2]/50 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#FAF8F5]" />
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between text-[9px] font-mono text-[#A795DC] mb-2">
              <span className="uppercase tracking-widest font-semibold">33⅓ RPM · HI-FI LP</span>
              <span className="px-1 py-0.5 rounded bg-[#8B78C2]/20 text-[8px]">STEREO</span>
            </div>

            <div className="pr-12">
              <h4 className="text-xs font-semibold text-[#FAF8F5] truncate">{receipt.title}</h4>
              <div className="text-[11px] text-[#A795DC] mt-0.5 truncate">{receipt.subtitle}</div>
            </div>

            {/* Subtle frequency spectrum */}
            <div className="mt-3 flex items-end space-x-1 h-4 pt-1">
              {[35, 60, 25, 80, 50, 90, 40, 70, 45, 85, 30, 55].map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-[#8B78C2]/40 rounded-sm transition-all group-hover:bg-[#8B78C2]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-[#8E939E]">
              <span>MATRIX: SKM-4421</span>
              <span>{receipt.metadata.bpm ? `${receipt.metadata.bpm} BPM` : 'LOSSLESS'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MOVIES: 35mm Celluloid Film Negative Strip */}
      {receipt.type === 'movies' && (
        <div className="bg-[#121012] border border-[#3D2224] group-hover:border-[#522F32] rounded p-3 shadow-sm transition-colors duration-150 relative">
          {/* Top Film Sprockets */}
          <div className="flex justify-between items-center px-1 pb-1.5 border-b border-[#3D2224]">
            <div className="flex space-x-1.5">
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
            </div>
            <span className="text-[8px] font-mono text-[#D25A5A] uppercase tracking-[0.2em]">
              KODAK SAFETY FILM · ▶ 24A
            </span>
            <div className="flex space-x-1.5">
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
            </div>
          </div>

          {/* Film Exposure Window */}
          <div className="py-2.5 px-1">
            <h4 className="font-editorial text-sm font-semibold text-[#FAF8F5] leading-tight">
              {receipt.title}
            </h4>
            <div className="text-[11px] text-[#E27878] mt-1 font-sans">
              {receipt.subtitle}
            </div>
            {receipt.location && (
              <div className="mt-2 text-[10px] font-mono text-[#8E939E] flex items-center space-x-1">
                <MapPin className="w-2.5 h-2.5 text-[#D25A5A]" />
                <span className="truncate">{receipt.location.name}</span>
              </div>
            )}
          </div>

          {/* Bottom Film Sprockets */}
          <div className="flex justify-between items-center px-1 pt-1.5 border-t border-[#3D2224]">
            <div className="flex space-x-1.5">
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
            </div>
            <span className="text-[8px] font-mono text-[#8E939E] tracking-wider">
              1.66:1 ANAMORPHIC
            </span>
            <div className="flex space-x-1.5">
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
              <span className="w-1.5 h-2 bg-[#2D1618] rounded-sm" />
            </div>
          </div>
        </div>
      )}

      {/* 4. PLACES: Architectural Blueprint Specimen & Brass Plate */}
      {receipt.type === 'places' && (
        <div className="bg-[#0E1513] border border-[#1E3326] group-hover:border-[#2C4A38] rounded p-3.5 shadow-sm transition-colors duration-150 relative">
          {/* Corner Blueprint Screw Accents */}
          <span className="absolute top-1 left-1.5 text-[8px] font-mono text-[#385945]">⌖</span>
          <span className="absolute top-1 right-1.5 text-[8px] font-mono text-[#385945]">⌖</span>

          <div className="flex items-start justify-between pl-2">
            <div>
              <div className="text-xs font-semibold text-[#FAF8F5] truncate">{receipt.title}</div>
              <div className="text-[11px] text-[#76B896] mt-0.5 truncate">{receipt.subtitle}</div>
            </div>
            <div className="p-1 rounded bg-[#5F9E7D]/15 text-[#76B896]">
              {getIcon()}
            </div>
          </div>

          {receipt.location && (
            <div className="mt-3 pt-2 border-t border-[#1E3326] flex items-center justify-between text-[10px] font-mono text-[#8E939E]">
              <span className="text-[#A5D2BA]">{receipt.location.city}</span>
              {receipt.location.coordinates ? (
                <span className="text-[#5F9E7D] tracking-tight">
                  {receipt.location.coordinates[0].toFixed(3)}°N, {receipt.location.coordinates[1].toFixed(3)}°E
                </span>
              ) : (
                <span>{timeStr}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. PHOTOS: Bordered Darkroom Silver-Halide Print */}
      {receipt.type === 'photos' && (
        <div className="bg-[#1A1A1E] border border-[#2D2D35] group-hover:border-[#3F3F4A] rounded-sm p-2 shadow-sm transition-colors duration-150">
          {receipt.metadata.url ? (
            <div className="w-full h-28 rounded-sm overflow-hidden relative bg-[#0A0C0E] border border-black/40">
              <img
                src={receipt.metadata.url}
                alt={receipt.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale-[20%] contrast-[110%] group-hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs px-1 py-0.5 rounded text-[8px] font-mono text-white/90 border border-white/10">
                {receipt.metadata.aperture || '35mm'}
              </div>
            </div>
          ) : (
            <div className="w-full h-24 bg-[#141418] rounded flex items-center justify-center text-[#5C8EA8]">
              <Camera className="w-6 h-6 opacity-40" />
            </div>
          )}

          {/* Pencil handwritten margin note underneath */}
          <div className="pt-2 px-1">
            <div className="text-xs font-serif italic text-[#FAF8F5] truncate leading-tight">
              {receipt.title}
            </div>
            <div className="text-[9px] font-mono text-[#8E939E] mt-1 flex justify-between border-t border-[#2D2D35] pt-1">
              <span>{receipt.metadata.camera || '35mm Summicron'}</span>
              <span>{receipt.metadata.iso ? `ISO ${receipt.metadata.iso}` : timeStr}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. SEARCHES: Continuous Tractor-Feed Teletype Tape */}
      {receipt.type === 'searches' && (
        <div className="bg-[#0F1517] border border-[#1C2C30] group-hover:border-[#294248] rounded p-3 shadow-sm transition-colors duration-150 relative">
          <div className="flex items-center justify-between text-[9px] font-mono text-[#70B5BF] mb-1.5 pb-1 border-b border-[#1C2C30]">
            <div className="flex items-center space-x-1">
              <Search className="w-2.5 h-2.5 text-[#70B5BF]" />
              <span className="uppercase tracking-widest">TELETYPE TAPE</span>
            </div>
            <span className="text-[8px] text-[#55787F] font-mono">PORT 80</span>
          </div>

          <div className="text-xs font-mono text-[#FAF8F5] leading-snug pl-1 border-l-2 border-[#70B5BF]">
            <span className="text-[#70B5BF] mr-1">&gt;</span>
            “{receipt.title}”
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-dashed border-[#1C2C30] flex items-center justify-between text-[9px] font-mono text-[#8E939E]">
            <span>{receipt.metadata.intent ? `INTENT: ${receipt.metadata.intent}` : 'EXPLORATION'}</span>
            <span>{timeStr}</span>
          </div>
        </div>
      )}

      {/* 7. NOTES: Archival Sepia Field Memo with Washi Tape Graphic */}
      {receipt.type === 'notes' && (
        <div className="bg-[#1A1813] border border-[#3A3324] group-hover:border-[#4F4632] rounded p-3.5 shadow-sm transition-colors duration-150 relative">
          {/* Translucent washi tape accent top */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#D1B898]/20 border border-[#D1B898]/40 rotate-1 backdrop-blur-xs shadow-xs" />

          {/* Classified observation stamp */}
          <div className="flex items-center justify-between text-[9px] font-mono text-[#D1B898] mb-1.5">
            <span className="uppercase tracking-widest border border-[#D1B898]/40 px-1 py-0.2 rounded-xs">
              FIELD MEMO
            </span>
            <span>{timeStr}</span>
          </div>

          <div className="font-editorial text-xs text-[#FAF8F5] font-medium leading-snug">
            {receipt.title}
          </div>
          <p className="mt-1 text-[11px] font-serif italic text-[#C9BFB5] line-clamp-2 leading-relaxed">
            {receipt.description}
          </p>
        </div>
      )}

      {/* 8. EVENTS: Perforated Admission Ticket Stub with Hologram */}
      {receipt.type === 'events' && (
        <div className="bg-[#18130E] border border-[#402C1B] group-hover:border-[#583D26] rounded p-3 shadow-sm transition-colors duration-150 relative">
          {/* Metallic Hologram security foil strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#EB9E58] via-[#F4D06F] to-[#EB9E58] rounded-full mb-2 opacity-80" />

          <div className="flex items-center justify-between text-[9px] font-mono text-[#EB9E58] mb-1">
            <span className="uppercase tracking-widest font-bold">ADMIT ONE PASS</span>
            <span className="text-[8px] px-1 rounded bg-[#EB9E58]/20">STUB #882</span>
          </div>

          <div className="text-xs font-semibold text-[#FAF8F5] leading-snug">
            {receipt.title}
          </div>
          <div className="text-[11px] text-[#EB9E58] mt-0.5">{receipt.subtitle}</div>

          {receipt.location && (
            <div className="mt-2.5 pt-1.5 border-t border-dashed border-[#402C1B] flex items-center justify-between text-[9px] font-mono text-[#8E939E]">
              <span className="truncate">📍 {receipt.location.name}</span>
              <span className="text-[#EB9E58]">SEC 1 · ROW G</span>
            </div>
          )}
        </div>
      )}

      {/* 9. MESSAGES: Airmail Chevron Border & Telegram Dispatch */}
      {receipt.type === 'messages' && (
        <div className="bg-[#181313] border border-[#3E2424] group-hover:border-[#523030] rounded p-3 shadow-sm transition-colors duration-150 relative overflow-hidden">
          {/* Airmail top diagonal chevron bar */}
          <div className="h-1 w-full bg-[repeating-linear-gradient(45deg,#D25A5A_0px,#D25A5A_6px,#FAF8F5_6px,#FAF8F5_12px,#4A6FA5_12px,#4A6FA5_18px)] mb-2 rounded-t opacity-70" />

          <div className="flex items-center justify-between text-[9px] font-mono text-[#E59585] mb-1.5">
            <span className="uppercase tracking-wider font-semibold">
              CABLEGRAM DISPATCH
            </span>
            <span>{timeStr}</span>
          </div>

          <div className="text-xs text-[#FAF8F5] font-mono leading-snug pl-1 border-l border-[#E59585]/40">
            {receipt.title}
          </div>

          <div className="mt-2 pt-1 border-t border-[#3E2424] flex items-center justify-between text-[9px] font-mono text-[#8E939E]">
            <span>{receipt.metadata.app || 'ENCRYPTED SIGNAL'}</span>
            <span className="text-[#E59585]">AUTHENTICATED</span>
          </div>
        </div>
      )}

      {/* Bottom Date Stamp */}
      <div className="mt-1.5 px-1 flex items-center justify-between text-[9px] font-mono text-[#5A5E66]">
        <span>{dateStr}</span>
        <span>{timeStr}</span>
      </div>
    </div>
  );
};
