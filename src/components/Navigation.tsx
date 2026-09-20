import React, { useState, useEffect, useRef } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  Menu, 
  X,
  ChevronDown,
  GitFork,
  Compass,
  Sparkles
} from 'lucide-react';
import { TraceriLogo } from './TraceriLogo';
import { useArchive } from '../context/ArchiveContext';

export const Navigation: React.FC = () => {
  const { archive, setShowDatasetModal } = useArchive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Primary options displayed directly on navbar for tablet & desktop
  const primaryNavLinks = [
    { to: '/', label: 'Archive', exact: true },
    { to: '/calendar', label: 'Calendar', exact: false },
    { to: '/story', label: 'Story', exact: false },
  ];

  // Secondary options grouped into the menu popover component
  const secondaryNavLinks = [
    { 
      to: '/threads', 
      label: 'Threads', 
      description: 'Recurrent themes & sequences',
      icon: GitFork 
    },
    { 
      to: '/atlas', 
      label: 'Atlas', 
      description: 'Spatial cartography & coordinates',
      icon: Compass 
    },
    { 
      to: '/discoveries', 
      label: 'Discoveries', 
      description: 'Algorithmic synthesis & deep insights',
      icon: Sparkles 
    },
  ];

  const isSecondaryActive = secondaryNavLinks.some((link) => currentPath.startsWith(link.to));

  // Close popovers on click outside or escape key
  useEffect(() => {
    if (!popoverOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [popoverOpen]);

  // Close menu popover and mobile drawer upon route navigation
  useEffect(() => {
    setPopoverOpen(false);
    setMobileMenuOpen(false);
  }, [currentPath]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0B0D]/90 backdrop-blur-md border-b border-[#232730] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Editorial Brand Wordmark */}
        <Link 
          to="/" 
          id="nav-logo-link"
          className="flex items-center space-x-3 group"
        >
          <TraceriLogo className="w-8 h-8 group-hover:scale-105 transition-transform shadow-sm" />
          <span className="font-editorial text-2xl tracking-[0.25em] font-semibold text-[#FAF8F5] group-hover:text-[#CFA04E] transition-colors">
            TRACERI
          </span>
          <span className="font-mono text-[9px] tracking-widest text-[#8E939E] border border-[#242934] px-1.5 py-0.5 rounded">
            VOL. 01
          </span>
          <span className="hidden lg:inline-block text-[11px] font-mono text-[#6A7080]">
            · {archive.totalTraces} Traces
          </span>
        </Link>

        {/* Center/Right: Minimized Primary Navbar + Menu Popover for Tablet & Desktop */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-mono">
          {primaryNavLinks.map((link) => {
            const isActive = link.exact
              ? currentPath === link.to
              : currentPath.startsWith(link.to);

            return (
              <Link
                key={link.to}
                to={link.to}
                id={`nav-link-${link.label.toLowerCase()}`}
                className={`relative px-3.5 py-2 rounded-lg transition-all duration-200 uppercase tracking-wider ${
                  isActive
                    ? 'text-[#FAF8F5] font-semibold bg-[#171B24]'
                    : 'text-[#8E939E] hover:text-[#FAF8F5] hover:bg-[#12151D]'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#CFA04E] rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* Menu Popover Trigger & Container */}
          <div ref={popoverRef} className="relative pl-1">
            <button
              id="nav-popover-toggle-btn"
              onClick={() => setPopoverOpen((prev) => !prev)}
              aria-expanded={popoverOpen}
              aria-haspopup="true"
              className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 uppercase tracking-wider text-xs font-mono border ${
                popoverOpen || isSecondaryActive
                  ? 'text-[#FAF8F5] font-semibold bg-[#171B24] border-[#313948]'
                  : 'text-[#8E939E] hover:text-[#FAF8F5] hover:bg-[#12151D] border-transparent'
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8E939E] transition-transform duration-200 ${
                  popoverOpen ? 'rotate-180 text-[#FAF8F5]' : ''
                }`}
              />
              {isSecondaryActive && !popoverOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#CFA04E] ml-0.5" />
              )}
            </button>

            {/* Menu Popover Dropdown Panel */}
            <AnimatePresence>
              {popoverOpen && (
                <motion.div
                  id="nav-menu-popover"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0E1017] border border-[#262C38] shadow-2xl backdrop-blur-xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#788090] uppercase border-b border-[#1A1F2B]">
                    <span>Archival Views</span>
                    <span className="text-[#CFA04E]">VOL. 01</span>
                  </div>

                  <div className="space-y-1">
                    {secondaryNavLinks.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentPath.startsWith(item.to);

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          id={`nav-popover-${item.label.toLowerCase()}`}
                          onClick={() => setPopoverOpen(false)}
                          className={`flex items-start space-x-3 px-2.5 py-2 rounded-lg transition-colors group ${
                            isActive
                              ? 'bg-[#181D28] text-[#FAF8F5]'
                              : 'text-[#8E939E] hover:text-[#FAF8F5] hover:bg-[#141822]'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-md mt-0.5 transition-colors ${
                              isActive
                                ? 'bg-[#CFA04E]/20 text-[#CFA04E]'
                                : 'bg-[#151922] text-[#8E939E] group-hover:text-[#FAF8F5] group-hover:bg-[#1C2230]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-medium tracking-wide uppercase">
                                {item.label}
                              </span>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#CFA04E]" />
                              )}
                            </div>
                            <p className="text-[11px] font-sans text-[#788090] leading-snug line-clamp-1 mt-0.5 group-hover:text-[#9EA5B4] transition-colors">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="my-1.5 border-t border-[#1F2532]" />

                  {/* Ingest Custom Dataset Option inside Menu Popover */}
                  <button
                    id="nav-popover-dataset-btn"
                    onClick={() => {
                      setShowDatasetModal(true);
                      setPopoverOpen(false);
                    }}
                    className="w-full flex items-start space-x-3 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-[#181D28] group"
                  >
                    <div className="p-1.5 rounded-md mt-0.5 bg-[#CFA04E]/10 text-[#CFA04E] group-hover:bg-[#CFA04E]/20 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium tracking-wide uppercase text-[#FAF8F5] group-hover:text-[#CFA04E] transition-colors">
                          Ingest Custom Dataset
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1 py-0.5 text-[#CFA04E] border border-[#CFA04E]/40 rounded bg-[#CFA04E]/10">
                          JSON
                        </span>
                      </div>
                      <p className="text-[11px] font-sans text-[#788090] leading-snug line-clamp-1 mt-0.5 group-hover:text-[#9EA5B4] transition-colors">
                        Import personal JSON or receipts
                      </p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            className="p-2 text-[#8E939E] hover:text-[#FAF8F5] hover:bg-[#151821] rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#232730] bg-[#0E1017] px-4 py-4 space-y-3">
          <div className="text-[10px] font-mono tracking-widest text-[#788090] uppercase px-1">
            Primary Views
          </div>
          <div className="space-y-1">
            {primaryNavLinks.map((link) => {
              const isActive = link.exact
                ? currentPath === link.to
                : currentPath.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider ${
                    isActive
                      ? 'bg-[#181C26] text-[#FAF8F5] font-bold border-l-2 border-[#CFA04E]'
                      : 'text-[#8E939E] hover:text-[#FAF8F5] hover:bg-[#13161F]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="text-[10px] font-mono tracking-widest text-[#788090] uppercase px-1 pt-2 border-t border-[#1C212B]">
            Archival Views
          </div>
          <div className="space-y-1">
            {secondaryNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider ${
                    isActive
                      ? 'bg-[#181C26] text-[#FAF8F5] font-bold border-l-2 border-[#CFA04E]'
                      : 'text-[#8E939E] hover:text-[#FAF8F5] hover:bg-[#13161F]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#CFA04E]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#1C212B]">
            <button
              id="mobile-nav-dataset-btn"
              onClick={() => {
                setShowDatasetModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 text-xs font-mono px-3 py-2.5 rounded-lg bg-[#181C25] border border-[#2A313E] text-[#FAF8F5] hover:border-[#CFA04E] transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-[#CFA04E]" />
              <span>Ingest Custom Dataset</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
