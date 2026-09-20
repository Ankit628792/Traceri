import React, { useEffect, useState } from 'react';

export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(0);
        ticking = false;
        return;
      }
      const currentScroll = window.scrollY;
      const pct = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setProgress(pct);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <aside
      id="reading-progress-bar-container"
      aria-label="Reading progress indicator"
      className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-[#0A0B0D]/40 backdrop-blur-xs pointer-events-none"
    >
      <div
        id="reading-progress-fill"
        className="h-full bg-gradient-to-r from-[#F97316] via-[#E5A93C] to-[#818CF8] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(229,169,60,0.8)]"
        style={{ width: `${progress}%` }}
      />
      {progress > 1 && (
        <div
          id="reading-progress-pip"
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FAF8F5] shadow-[0_0_8px_#FAF8F5] transition-all duration-75"
          style={{ left: `calc(${progress}% - 3px)` }}
        />
      )}
    </aside>
  );
};
