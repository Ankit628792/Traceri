import React from 'react';
import { Link } from '@tanstack/react-router';
import { useArchive } from '../context/ArchiveContext';
import {
  Instagram,
  Linkedin,
  ArrowUp,
  ExternalLink,
  Sparkles,
  GitFork,
  Archive,
  BookOpen,
} from 'lucide-react';
import { TraceriLogo } from './TraceriLogo';

export const Footer: React.FC = () => {
  const { archive } = useArchive();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const currentYear = new Date().getFullYear();

  const navLinks = [
    { to: '/', label: 'Main Archive', icon: Archive, badge: `${archive.totalTraces} Traces` },
    { to: '/story', label: 'Story Mode', icon: BookOpen, badge: 'Essays' },
    { to: '/threads', label: 'Thematic Threads', icon: GitFork, badge: `${archive.threads.length} Threads` },
    { to: '/discoveries', label: 'Discoveries', icon: Sparkles, badge: 'Synthesis' },
  ];

  return (
    <footer
      id="traceri-global-footer"
      className="border-t border-[#232730] bg-[#07080B] text-[#8E939E] relative mt-24 pt-16 pb-12 transition-colors overflow-hidden"
    >
      {/* Top subtle decorative ambient glow line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#CFA04E]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-[#1E232E]">
          
          {/* Column 1: Brand & Philosophy (6 cols on desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <Link to="/" className="group flex items-center space-x-2.5">
                <TraceriLogo className="w-8 h-8 group-hover:scale-105 transition-transform shadow-sm" />
                <span className="font-editorial text-2xl sm:text-3xl tracking-[0.2em] font-semibold text-[#FAF8F5] group-hover:text-[#CFA04E] transition-colors">
                  TRACERI
                </span>
              </Link>
              <span className="font-mono text-[9px] tracking-widest text-[#CFA04E] border border-[#CFA04E]/30 bg-[#CFA04E]/10 px-2 py-0.5 rounded">
                VOL. 01 · 2026
              </span>
            </div>

            <p className="font-editorial italic text-base text-[#FAF8F5]/90 tracking-wide">
              Every moment leaves a trace.
            </p>

            <p className="font-sans text-xs text-[#8E939E] leading-relaxed max-w-md">
              An interactive digital life archive, editorial magazine, and empirical data archaeology.
              Transforming fragmented digital receipts into structured human stories through relational synthesis.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#121620] border border-[#242A36] text-[11px] font-mono text-[#76B896]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5F9E7D] animate-pulse" />
                <span>ENGINE ONLINE</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#121620] border border-[#242A36] text-[11px] font-mono text-[#FAF8F5]/80">
                <span>{archive.totalTraces} RECORDED TRACES</span>
              </span>
            </div>
          </div>

          {/* Column 2: Navigation & Views (3 cols on desktop) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-xs text-[#FAF8F5] uppercase tracking-widest flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CFA04E]" />
              <span>NAVIGATION</span>
            </h4>
            <ul className="space-y-1.5 text-xs font-mono">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group flex items-center justify-between py-1.5 px-2 rounded-lg text-[#8E939E] hover:text-[#FAF8F5] hover:bg-[#13161F] border border-transparent hover:border-[#232730] transition-all"
                    >
                      <span className="flex items-center space-x-2">
                        <Icon className="w-3.5 h-3.5 text-[#8E939E] group-hover:text-[#CFA04E] transition-colors" />
                        <span>{link.label}</span>
                      </span>
                      <span className="text-[10px] text-[#6B7280] group-hover:text-[#8E939E]">
                        {link.badge}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Developer & Creator Socials (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-mono text-xs text-[#FAF8F5] uppercase tracking-widest flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B78C2]" />
              <span>DEVELOPER & CREATOR</span>
            </h4>

            {/* Developer Social Links Only */}
            <div className="space-y-2.5">
              <a
                id="footer-instagram-link"
                href="https://www.instagram.com/ankit_628792"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#12151D] hover:bg-[#1B202C] border border-[#232730] hover:border-[#CFA04E]/50 text-xs font-mono text-[#FAF8F5] group transition-all"
              >
                <span className="flex items-center space-x-2.5">
                  <Instagram className="w-4 h-4 text-[#D67C6B] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-[#CFA04E] transition-colors">Instagram</span>
                </span>
                <span className="flex items-center space-x-1 text-[11px] text-[#8E939E] group-hover:text-[#FAF8F5]">
                  <span>@ankit_628792</span>
                  <ExternalLink className="w-3 h-3 text-[#6B7280] group-hover:text-[#FAF8F5]" />
                </span>
              </a>

              <a
                id="footer-linkedin-link"
                href="https://www.linkedin.com/in/ankit628792"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#12151D] hover:bg-[#1B202C] border border-[#232730] hover:border-[#569CA6]/50 text-xs font-mono text-[#FAF8F5] group transition-all"
              >
                <span className="flex items-center space-x-2.5">
                  <Linkedin className="w-4 h-4 text-[#569CA6] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-[#569CA6] transition-colors">LinkedIn</span>
                </span>
                <span className="flex items-center space-x-1 text-[11px] text-[#8E939E] group-hover:text-[#FAF8F5]">
                  <span>ankit628792</span>
                  <ExternalLink className="w-3 h-3 text-[#6B7280] group-hover:text-[#FAF8F5]" />
                </span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright, System Specs, Back-to-Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8E939E]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="text-[#FAF8F5] font-semibold">
              © {currentYear} Traceri.
            </span>
            <span className="hidden sm:inline text-[#2A313E]">|</span>
            <span>All rights reserved.</span>
            <span className="hidden sm:inline text-[#2A313E]">|</span>
            <span className="text-[#6B7280]">
              Empirical Digital Life Archive · Deterministic Engine
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              id="footer-back-to-top-btn"
              onClick={scrollToTop}
              className="px-3 py-1.5 rounded-lg bg-[#12151D] hover:bg-[#1B202C] border border-[#242A36] hover:border-[#CFA04E] text-xs font-mono text-[#FAF8F5] flex items-center space-x-2 transition-all group"
              aria-label="Back to top"
            >
              <span>TOP</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#CFA04E] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
