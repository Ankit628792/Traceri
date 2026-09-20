import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ProcessedArchive } from '../types';
import { ArrowDown, Compass, Sparkles } from 'lucide-react';
import { CATEGORY_META } from '../utils/engine';

interface HeroProps {
  archive: ProcessedArchive;
  onExploreArchive: () => void;
  onFollowThreads: () => void;
  onEnterStory: () => void;
}

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const Hero: React.FC<HeroProps> = ({
  archive,
  onExploreArchive,
  onFollowThreads,
  onEnterStory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Kinetic constellation canvas animation in background driven by actual receipts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 560);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 560;
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles mapped to real receipts
    const particles = archive.receipts.slice(0, 32).map((r) => {
      const cat = CATEGORY_META[r.type];
      return {
        id: r.id,
        title: r.title,
        type: r.type,
        color: cat.color,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: r.type === 'places' || r.type === 'movies' ? 3.5 : 2.5,
        alpha: 0.3 + Math.random() * 0.5,
      };
    });

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const opacity = (1 - dist / 140) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(207, 160, 78, ${opacity})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes and tiny label fragments
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 10) p.vx = Math.abs(p.vx);
        if (p.x > width - 10) p.vx = -Math.abs(p.vx);
        if (p.y < 10) p.vy = Math.abs(p.vy);
        if (p.y > height - 10) p.vy = -Math.abs(p.vy);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Tiny typographic fragment
        ctx.fillStyle = 'rgba(142, 147, 158, 0.4)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(p.id, p.x + 6, p.y + 3);
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [archive]);

  return (
    <div className="relative w-full border-b border-[#232730] overflow-hidden bg-gradient-to-b from-[#0A0B0D] via-[#0E1015] to-[#0A0B0D]">
      {/* Background kinetic constellation canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full opacity-60"
      />

      <motion.div
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col justify-between min-h-[500px]"
      >
        
        {/* Top Header metadata */}
        <motion.div variants={heroItemVariants} className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8E939E] border-b border-[#232730]/60 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-[#CFA04E] font-semibold">VOLUME 01</span>
            <span>/</span>
            <span>AUTUMN — SPRING ARCHIVE</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>DETERMINISTIC KNOWLEDGE GRAPH</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-[#FAF8F5]">ZERO FABRICATIONS</span>
          </div>
        </motion.div>

        {/* Hero Title & Statements */}
        <div className="my-8 sm:my-12">
          <motion.div variants={heroItemVariants} className="inline-block mb-3 font-mono text-[11px] tracking-[0.3em] uppercase text-[#8E939E]">
            YOUR DIGITAL LIFE, VISUALIZED
          </motion.div>

          <motion.h1 variants={heroItemVariants} className="font-editorial text-6xl sm:text-8xl lg:text-9xl font-light tracking-tight text-[#FAF8F5] leading-none mb-4">
            TRACERI
          </motion.h1>

          <motion.p variants={heroItemVariants} className="font-editorial text-xl sm:text-3xl text-[#FAF8F5]/90 tracking-wide max-w-3xl italic">
            Every moment leaves a trace.
          </motion.p>

          <motion.p variants={heroItemVariants} className="mt-4 text-sm font-sans text-[#8E939E] max-w-2xl leading-relaxed">
            Raw digital events assembled into interconnected memories. Receipts, searches, tickets,
            and coordinates reveal the invisible architecture of your life.
          </motion.p>

          {/* Quick Stats Ribbon with Rich Editorial Chromatic Tags */}
          <motion.div variants={heroItemVariants} className="mt-8 flex flex-wrap gap-3 sm:gap-4 text-xs font-mono">
            <div className="px-3.5 py-1.5 rounded-lg bg-[#141722]/80 border border-[#E5A93C]/40 flex items-center space-x-2 shadow-[0_0_15px_rgba(229,169,60,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
              <span className="text-[#FAF8F5] font-semibold">{archive.totalTraces}</span>
              <span className="text-[#E5A93C]">TRACES</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-[#0F201B]/80 border border-[#10B981]/40 flex items-center space-x-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[#FAF8F5] font-semibold">{archive.placeCounts.length}</span>
              <span className="text-[#34D399]">LOCATIONS</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-[#1B142E]/80 border border-[#8B5CF6]/40 flex items-center space-x-2 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span className="text-[#C4B5FD] font-semibold">{archive.threads.length}</span>
              <span className="text-[#A78BFA]">THREADS</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-[#271018]/80 border border-[#F43F5E]/40 flex items-center space-x-2 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
              <span className="text-[#FDA4AF] font-semibold">{archive.chapters.length}</span>
              <span className="text-[#FB7185]">CHAPTERS</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-lg bg-[#0C1F2B]/80 border border-[#06B6D4]/40 flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
              <span className="text-[#67E8F9] font-semibold">{archive.connections.length}</span>
              <span className="text-[#22D3EE]">CONNECTIONS</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Actions Bar */}
        <motion.div variants={heroItemVariants} className="pt-6 border-t border-[#232730]/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-explore-archive-btn"
              onClick={onExploreArchive}
              data-cursor-label="BENTO"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#FAF8F5] to-[#E5A93C] text-[#0A0B0D] font-sans text-xs font-bold tracking-wider hover:brightness-105 transition-all flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <span>EXPLORE BENTO & ARCHIVE</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <button
              id="hero-follow-threads-btn"
              onClick={onFollowThreads}
              data-cursor-label="THREADS"
              className="px-4 py-2.5 rounded-lg bg-[#13161C] border border-[#2A313E] text-[#FAF8F5] font-sans text-xs font-medium tracking-wider hover:bg-[#1C2028] hover:border-[#E5A93C] transition-all flex items-center space-x-2"
            >
              <Compass className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>FOLLOW THREADS</span>
            </button>

            <button
              id="hero-enter-story-btn"
              onClick={onEnterStory}
              data-cursor-label="STORY"
              className="px-4 py-2.5 rounded-lg bg-[#13161C] border border-[#2A313E] text-[#FAF8F5] font-sans text-xs font-medium tracking-wider hover:bg-[#1C2028] hover:border-[#8B5CF6] transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>ENTER STORY</span>
            </button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};
