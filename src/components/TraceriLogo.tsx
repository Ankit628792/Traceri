import React from 'react';

interface TraceriLogoProps {
  className?: string;
  size?: number | string;
}

export const TraceriLogo: React.FC<TraceriLogoProps> = ({
  className = 'w-6 h-6',
  size,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
      className={`inline-block select-none ${className}`}
      aria-label="Traceri Logo"
    >
      <defs>
        <linearGradient id="t-gold" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2D184" />
          <stop offset="50%" stopColor="#CFA04E" />
          <stop offset="100%" stopColor="#936D25" />
        </linearGradient>
        <linearGradient id="t-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#171B25" />
          <stop offset="100%" stopColor="#08090C" />
        </linearGradient>
        <radialGradient id="t-glow" cx="50" cy="50" r="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CFA04E" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#CFA04E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Frame Container */}
      <rect width="100" height="100" rx="22" fill="url(#t-bg)" stroke="#2D3442" strokeWidth="2" />

      {/* Astrolabe Grid */}
      <circle cx="50" cy="50" r="34" stroke="#222836" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="50" y1="16" x2="50" y2="84" stroke="#222836" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="16" y1="50" x2="84" y2="50" stroke="#222836" strokeWidth="1" strokeDasharray="2 3" />

      {/* Ambient Radial Core */}
      <circle cx="50" cy="50" r="26" fill="url(#t-glow)" />

      {/* Golden Life Trace */}
      <path d="M 22 74 C 24 38, 44 22, 78 26" stroke="url(#t-gold)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Harmonic Resonance Line */}
      <path d="M 30 78 C 64 74, 76 56, 78 28" stroke="#569CA6" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85" />

      {/* Primary Trace Coordinate Node */}
      <circle cx="50" cy="50" r="6" fill="#FAF8F5" stroke="#CFA04E" strokeWidth="2.5" />

      {/* Sub-coordinates */}
      <circle cx="68" cy="38" r="3" fill="#CFA04E" />
      <circle cx="28" cy="64" r="2.5" fill="#76B896" />
    </svg>
  );
};
