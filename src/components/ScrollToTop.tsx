import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollY > 240) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      if (totalHeight > 0) {
        const pct = Math.min(100, Math.round((scrollY / totalHeight) * 100));
        setScrollPercentage(pct);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG Progress circle calculation
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercentage / 100) * circumference;

  return (
    <div
      id="scroll-to-top-wrapper"
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 transform ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
      }`}
    >
      <button
        id="scroll-to-top-btn"
        onClick={scrollToTop}
        data-cursor-label="TOP"
        aria-label="Scroll back to top"
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#12151D]/90 backdrop-blur-md border border-[#2A313E] hover:border-[#E5A93C] text-[#FAF8F5] hover:text-[#E5A93C] shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {/* SVG Circular Reading Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1"
          viewBox="0 0 44 44"
        >
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-[#232734]"
            strokeWidth="2.5"
            fill="none"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-[#E5A93C] transition-all duration-75"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Icon & Mini Tooltip */}
        <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />

        {/* Hover Tooltip */}
        <span className="absolute -top-8 right-0 px-2 py-0.5 rounded bg-[#0A0B0D] border border-[#2A313E] text-[10px] font-mono text-[#FAF8F5] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
          {scrollPercentage}% TOP
        </span>
      </button>
    </div>
  );
};
