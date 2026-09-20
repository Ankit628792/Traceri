import React, { useEffect, useRef, useState, Component, type ReactNode } from 'react';

interface Point {
  x: number;
  y: number;
}

interface CursorErrorBoundaryProps {
  children: ReactNode;
}

interface CursorErrorBoundaryState {
  hasError: boolean;
}

// Resilient boundary so any cursor failure never impacts the main editorial layout
class CursorErrorBoundary extends Component<CursorErrorBoundaryProps, CursorErrorBoundaryState> {
  state: CursorErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CursorErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('CustomCursor encountered a non-fatal error:', error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const CursorContent: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string>('');
  const [isClicked, setIsClicked] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Mouse coords & physics state
  const mousePos = useRef<Point>({ x: -100, y: -100 });
  const ringPos = useRef<Point>({ x: -100, y: -100 });
  const trailHistory = useRef<Point[]>([]);

  // Ref tracking to avoid thrashing useEffect event listeners
  const isVisibleRef = useRef(false);
  const isHoveredRef = useRef(false);
  const hoverLabelRef = useRef('');

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    hoverLabelRef.current = hoverLabel;
  }, [hoverLabel]);

  useEffect(() => {
    // Check if touch device / pointer fine
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisibleRef.current) {
        setIsVisible(true);
        isVisibleRef.current = true;
      }

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactiveEl = target.closest(
          'button, a, input, select, textarea, [role="button"], [data-cursor], .receipt-card'
        );
        if (interactiveEl) {
          let newLabel = '';
          const customLabel = interactiveEl.getAttribute('data-cursor-label');
          if (customLabel) {
            newLabel = customLabel;
          } else if (interactiveEl.closest('.receipt-card')) {
            newLabel = 'INSPECT';
          }

          if (!isHoveredRef.current) {
            setIsHovered(true);
            isHoveredRef.current = true;
          }
          if (hoverLabelRef.current !== newLabel) {
            setHoverLabel(newLabel);
            hoverLabelRef.current = newLabel;
          }
        } else {
          if (isHoveredRef.current) {
            setIsHovered(false);
            isHoveredRef.current = false;
          }
          if (hoverLabelRef.current !== '') {
            setHoverLabel('');
            hoverLabelRef.current = '';
          }
        }
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => {
      setIsVisible(false);
      isVisibleRef.current = false;
    };
    const onMouseEnter = () => {
      setIsVisible(true);
      isVisibleRef.current = true;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Canvas resize for trail
    const canvas = trailCanvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const handleResize = () => {
      if (trailCanvasRef.current) {
        trailCanvasRef.current.width = window.innerWidth;
        trailCanvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with Lerp & Ribbon Trail
    let animId: number;
    const render = () => {
      // Direct Dot Position
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Smooth Ring Lerp
      const lerpFactor = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Record trail points
      if (mousePos.current.x > 0 && mousePos.current.y > 0) {
        trailHistory.current.unshift({ x: ringPos.current.x, y: ringPos.current.y });
        if (trailHistory.current.length > 14) {
          trailHistory.current.pop();
        }
      }

      // Draw following trail on transparent canvas
      const ctx = trailCanvasRef.current?.getContext('2d');
      if (ctx && trailCanvasRef.current) {
        ctx.clearRect(0, 0, trailCanvasRef.current.width, trailCanvasRef.current.height);

        if (trailHistory.current.length > 2 && isVisibleRef.current) {
          // Draw connecting fluid ribbon trail
          for (let i = 0; i < trailHistory.current.length - 1; i++) {
            const p1 = trailHistory.current[i];
            const p2 = trailHistory.current[i + 1];
            const progress = 1 - i / trailHistory.current.length;
            const width = isHoveredRef.current ? 4 * progress : 2.5 * progress;
            const alpha = 0.45 * progress;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Elegant amber/gold luminous glow
            ctx.strokeStyle = `rgba(229, 184, 105, ${alpha})`;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Trail particle beads
            if (i % 3 === 0) {
              ctx.beginPath();
              ctx.arc(p1.x, p1.y, Math.max(1, 2.5 * progress), 0, Math.PI * 2);
              ctx.fillStyle = `rgba(250, 248, 245, ${alpha * 0.8})`;
              ctx.fill();
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (isTouch) return null;

  return (
    <div
      id="custom-cursor-container"
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Canvas for flowing trail ribbon */}
      <canvas
        ref={trailCanvasRef}
        className="fixed inset-0 pointer-events-none z-[9997]"
      />

      {/* Lagging Trailing Ring / Reticle */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center transition-[width,height,background-color,border-color] duration-200 ease-out will-change-transform ${
          isHovered
            ? 'w-14 h-14 rounded-full border border-[#E5B869] bg-[#E5B869]/10 shadow-[0_0_20px_rgba(229,184,105,0.3)] backdrop-blur-[0.5px]'
            : isClicked
            ? 'w-6 h-6 rounded-full border border-[#FAF8F5]/80 bg-[#E5B869]/20'
            : 'w-8 h-8 rounded-full border border-[#E5B869]/40 bg-transparent'
        }`}
      >
        {hoverLabel && (
          <span className="text-[9px] font-mono tracking-widest text-[#FAF8F5] uppercase font-bold bg-[#0A0B0D]/90 px-1.5 py-0.5 rounded border border-[#E5B869]/50 shadow-md">
            {hoverLabel}
          </span>
        )}
      </div>

      {/* Precise Target Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform transition-[transform,width,height,background-color] duration-75 ${
          isClicked
            ? 'w-2 h-2 rounded-full bg-[#FAF8F5] shadow-[0_0_8px_#FAF8F5]'
            : isHovered
            ? 'w-2.5 h-2.5 rounded-full bg-[#E5B869] shadow-[0_0_10px_rgba(229,184,105,0.9)]'
            : 'w-2 h-2 rounded-full bg-[#FAF8F5] shadow-[0_0_6px_rgba(250,248,245,0.8)]'
        }`}
      />
    </div>
  );
};

export const CustomCursor: React.FC = () => {
  return (
    <CursorErrorBoundary>
      <CursorContent />
    </CursorErrorBoundary>
  );
};
