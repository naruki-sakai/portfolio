"use client";

import { useRef, useEffect, useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  /** origin x */
  ox: number;
  /** origin y */
  oy: number;
  vx: number;
  vy: number;
  /** true = primary color, false = gray */
  dark: boolean;
  /** per-particle radial spread multiplier for ring thickness */
  spread: number;
}

interface CharData {
  char: string;
  x: number;
  /** vertical center of this character's line */
  lineY: number;
  width: number;
  particles: Particle[];
  /** true while any particle is displaced */
  wasDisplaced: boolean;
  /** 1→0 bounce animation progress */
  bounceT: number;
  /** temporally-smoothed scatter ratio (anti-flicker) */
  smoothScatter: number;
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ParticleTextProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  /** Gap between sampled pixels (CSS px). Lower = more particles. */
  density?: number;
  /** Uniform size of each particle (CSS px). */
  particleSize?: number;
  /** Radius of mouse repulsion effect (CSS px). */
  repulsionRadius?: number;
  /** Strength of mouse repulsion force. */
  repulsionStrength?: number;
  /** Letter spacing (e.g. "0.04em"). */
  letterSpacing?: string;
  className?: string;
  onClick?: () => void;
  color?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const GRAY_COLOR = "#9CA3AF";
const DARK_RATIO = 0.9;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function ParticleText({
  text,
  fontSize = 48,
  fontFamily = "system-ui, -apple-system, sans-serif",
  density = 1.6,
  particleSize = 2.5,
  repulsionRadius = 100,
  repulsionStrength = 22,
  letterSpacing = "0px",
  className = "",
  onClick,
  color = "#111827",
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<CharData[]>([]);
  const linesInfoRef = useRef<{ text: string; xOffset: number; y: number }[]>(
    [],
  );
  const animFrameRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0, paddingX: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999, hovering: false });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  /* ---------- reduced-motion query ---------- */

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  /* ---------- draw crisp settled text ---------- */

  const applyLetterSpacing = (ctx: CanvasRenderingContext2D) => {
    if ("letterSpacing" in ctx) {
      (ctx as unknown as Record<string, string>).letterSpacing = letterSpacing;
    }
  };

  const drawSettled = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const dpr = window.devicePixelRatio || 1;
      const { w, h } = sizeRef.current;
      const font = `bold ${fontSize}px ${fontFamily}`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = font;
      applyLetterSpacing(ctx);
      ctx.fillStyle = color;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      for (const li of linesInfoRef.current) {
        ctx.fillText(li.text, li.xOffset, li.y);
      }
    },
    [text, fontSize, fontFamily, letterSpacing, color],
  );

  /* ---------- initialise particles from text pixels ---------- */

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const font = `bold ${fontSize}px ${fontFamily}`;
    const paddingX = Math.ceil(fontSize * 3);
    const paddingY = Math.ceil(fontSize * 3);
    const lineHeight = fontSize * 1.4;

    // Measure per-character positions (accounts for kerning)
    const tmpCanvas = document.createElement("canvas");
    const tmpCtx = tmpCanvas.getContext("2d");
    if (!tmpCtx) return;
    tmpCtx.font = font;
    applyLetterSpacing(tmpCtx);

    const lines = text.split("\n");
    const lineWidths = lines.map((line) => tmpCtx.measureText(line).width);
    const maxLineWidth = Math.max(...lineWidths);

    const width = Math.ceil(maxLineWidth + paddingX * 2);
    const height = Math.ceil(lineHeight * lines.length + paddingY * 2);

    const chars: CharData[] = [];
    const linesInfo: { text: string; xOffset: number; y: number }[] = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const lineY =
        height / 2 + (lineIdx - (lines.length - 1) / 2) * lineHeight;
      // Center each line horizontally
      const lineXOffset =
        paddingX + (maxLineWidth - lineWidths[lineIdx]) / 2;

      linesInfo.push({ text: line, xOffset: lineXOffset, y: lineY });

      for (let i = 0; i < line.length; i++) {
        const xBefore = tmpCtx.measureText(line.slice(0, i)).width;
        const xAfter = tmpCtx.measureText(line.slice(0, i + 1)).width;
        chars.push({
          char: line[i],
          x: lineXOffset + xBefore,
          lineY,
          width: xAfter - xBefore,
          particles: [],
          wasDisplaced: false,
          bounceT: 0,
          smoothScatter: 0,
        });
      }
    }

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    sizeRef.current = { w: width, h: height, paddingX };
    setCanvasSize({ width, height });
    linesInfoRef.current = linesInfo;

    // Off-screen canvas for pixel sampling
    const offscreen = document.createElement("canvas");
    offscreen.width = width * dpr;
    offscreen.height = height * dpr;
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    offCtx.font = font;
    applyLetterSpacing(offCtx);
    offCtx.fillStyle = "#000";
    offCtx.textBaseline = "middle";
    offCtx.textAlign = "left";
    for (const li of linesInfo) {
      offCtx.fillText(li.text, li.xOffset, li.y);
    }

    const imgData = offCtx.getImageData(
      0,
      0,
      offscreen.width,
      offscreen.height,
    );
    const gap = Math.max(1, Math.round(density * dpr));

    for (let y = 0; y < imgData.height; y += gap) {
      for (let x = 0; x < imgData.width; x += gap) {
        const idx = (y * imgData.width + x) * 4;
        if (imgData.data[idx + 3] > 128) {
          const px = x / dpr;
          const py = y / dpr;
          for (const cd of chars) {
            if (
              px >= cd.x &&
              px < cd.x + cd.width &&
              Math.abs(py - cd.lineY) < lineHeight / 2
            ) {
              cd.particles.push({
                x: px,
                y: py,
                ox: px,
                oy: py,
                vx: 0,
                vy: 0,
                dark: Math.random() < DARK_RATIO,
                spread: 0.7 + Math.random() * 0.6,
              });
              break;
            }
          }
        }
      }
    }

    charsRef.current = chars;
    drawSettled(ctx);
  }, [text, fontSize, fontFamily, letterSpacing, density, drawSettled]);

  /* ---------- per-frame animation ---------- */

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { w, h } = sizeRef.current;
    const chars = charsRef.current;
    const font = `bold ${fontSize}px ${fontFamily}`;
    const mouse = mouseRef.current;
    let anyMoving = false;

    /* --- physics (localized: only particles whose origin is near the mouse scatter) --- */
    for (const cd of chars) {
      for (const p of cd.particles) {
        // Use origin-to-mouse distance to decide if this particle is affected
        const dxo = p.ox - mouse.x;
        const dyo = p.oy - mouse.y;
        const originDist = Math.sqrt(dxo * dxo + dyo * dyo);
        const nearMouse = mouse.hovering && originDist < repulsionRadius;

        // Is this particle displaced from its origin?
        const displaced =
          Math.abs(p.x - p.ox) > 0.3 ||
          Math.abs(p.y - p.oy) > 0.3 ||
          Math.abs(p.vx) > 0.05 ||
          Math.abs(p.vy) > 0.05;

        if (nearMouse) {
          // Repulsion from mouse (current position)
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.1) {
            const norm = Math.min(1, dist / repulsionRadius);
            const force =
              repulsionStrength * (1 - norm) * (1 - norm) * p.spread;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }

          // Weak origin spring
          p.vx += (p.ox - p.x) * 0.005;
          p.vy += (p.oy - p.y) * 0.005;

          // Light noise
          p.vx += (Math.random() - 0.5) * 0.5;
          p.vy += (Math.random() - 0.5) * 0.5;

          // Damping
          p.vx *= 0.88;
          p.vy *= 0.88;
          p.x += p.vx;
          p.y += p.vy;
          anyMoving = true;
        } else if (displaced) {
          // Spring return (same for during-hover-but-far and after-hover)
          const dx = p.ox - p.x;
          const dy = p.oy - p.y;

          p.vx += dx * 0.1;
          p.vy += dy * 0.1;
          p.vx *= 0.8;
          p.vy *= 0.8;
          p.x += p.vx;
          p.y += p.vy;

          if (
            Math.abs(dx) < 0.3 &&
            Math.abs(dy) < 0.3 &&
            Math.abs(p.vx) < 0.05 &&
            Math.abs(p.vy) < 0.05
          ) {
            p.x = p.ox;
            p.y = p.oy;
            p.vx = 0;
            p.vy = 0;
          } else {
            anyMoving = true;
          }
        }
        // else: particle at rest, far from mouse — do nothing
      }
    }

    /* --- per-character state (bounce, scatter tracking) --- */
    for (const cd of chars) {
      let charHasMoving = false;
      for (const p of cd.particles) {
        if (p.x !== p.ox || p.y !== p.oy || p.vx !== 0 || p.vy !== 0) {
          charHasMoving = true;
          break;
        }
      }

      if (charHasMoving) {
        cd.wasDisplaced = true;
      } else if (cd.wasDisplaced && !mouse.hovering && cd.bounceT <= 0) {
        // Particles just settled after hover — trigger bounce for THIS char only
        cd.bounceT = 1;
        cd.wasDisplaced = false;
      }

      if (cd.bounceT > 0) {
        cd.bounceT = Math.max(0, cd.bounceT - 0.04);
        anyMoving = true;
      }
    }

    /* --- render with smoothed crossfade & circular particles --- */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.font = font;
    applyLetterSpacing(ctx);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    const radius = particleSize / 2;
    const primaryRgb = hexToRgb(color);
    const grayRgb = hexToRgb(GRAY_COLOR);

    for (const cd of chars) {
      // Smoothed scatter ratio — asymmetric lerp prevents flicker on settle
      let charDisp = 0;
      for (const p of cd.particles) {
        charDisp += Math.abs(p.x - p.ox) + Math.abs(p.y - p.oy);
      }
      const avgCharDisp =
        cd.particles.length > 0 ? charDisp / cd.particles.length : 0;
      const rawScatter = Math.min(1, avgCharDisp / 4);
      const lerpFactor = rawScatter > cd.smoothScatter ? 0.5 : 0.12;
      cd.smoothScatter += (rawScatter - cd.smoothScatter) * lerpFactor;
      const scatter = cd.smoothScatter;

      if (scatter > 0.005 || cd.bounceT > 0) {
        anyMoving = true;
      }

      // Bounce Y-offset (only for chars that were actually scattered)
      const bounceY =
        cd.bounceT > 0 ? -3 * Math.sin(cd.bounceT * Math.PI) : 0;

      // Crisp text (smooth fade-in as particles converge)
      ctx.globalAlpha = 1 - scatter;
      ctx.fillStyle = color;
      ctx.fillText(cd.char, cd.x, cd.lineY + bounceY);

      // Circular particles, batched by color for performance
      if (scatter > 0.005) {
        ctx.globalAlpha = scatter;

        // Gray particles near their text origin are drawn as primary color
        // to prevent gray flicker on/near settled text.
        // Larger radius when converging to catch returning particles earlier.
        const grayNearSq = mouse.hovering ? 15 * 15 : 30 * 30;

        // Batch 1: primary color — dark particles + gray particles near origin
        ctx.fillStyle = color;
        ctx.beginPath();
        for (const p of cd.particles) {
          if (p.x === p.ox && p.y === p.oy) continue;
          if (p.dark) {
            ctx.moveTo(p.x + radius, p.y);
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          } else {
            const dx = p.x - p.ox;
            const dy = p.y - p.oy;
            if (dx * dx + dy * dy < grayNearSq) {
              ctx.moveTo(p.x + radius, p.y);
              ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            }
          }
        }
        ctx.fill();

        // Batch 2: gray particles far from origin — blend toward primary
        // When converging (!hovering), blend 2.5x more aggressively
        const effScatter = mouse.hovering ? scatter : scatter * 0.4;
        const bt = Math.max(0, Math.min(1, 1 - effScatter / 0.6));
        const br = Math.round(grayRgb[0] + (primaryRgb[0] - grayRgb[0]) * bt);
        const bg = Math.round(grayRgb[1] + (primaryRgb[1] - grayRgb[1]) * bt);
        const bb = Math.round(grayRgb[2] + (primaryRgb[2] - grayRgb[2]) * bt);
        ctx.fillStyle = `rgb(${br},${bg},${bb})`;
        ctx.beginPath();
        for (const p of cd.particles) {
          if (!p.dark && (p.x !== p.ox || p.y !== p.oy)) {
            const dx = p.x - p.ox;
            const dy = p.y - p.oy;
            if (dx * dx + dy * dy >= grayNearSq) {
              ctx.moveTo(p.x + radius, p.y);
              ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            }
          }
        }
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;

    if (anyMoving) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      // All particles settled — draw crisp text & stop the loop
      drawSettled(ctx);
    }
  }, [
    fontSize,
    fontFamily,
    repulsionRadius,
    repulsionStrength,
    particleSize,
    color,
    drawSettled,
  ]);

  /* ---------- mount / resize ---------- */

  useEffect(() => {
    if (prefersReducedMotion) return;
    initParticles();

    const handleResize = () => {
      cancelAnimationFrame(animFrameRef.current);
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles, prefersReducedMotion]);

  /* ---------- mouse handlers ---------- */

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.hovering = true;

      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(animate);
    },
    [prefersReducedMotion, animate],
  );

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;
    mouseRef.current.hovering = false;
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  }, [prefersReducedMotion, animate]);

  /* ---------- reduced-motion fallback ---------- */

  if (prefersReducedMotion) {
    return (
      <span
        className={className}
        style={{
          fontSize,
          fontFamily,
          fontWeight: "bold",
          color,
          whiteSpace: "pre-line",
        }}
        onClick={onClick}
        role={onClick ? "button" : undefined}
      >
        {text}
      </span>
    );
  }

  /* ---------- render ---------- */

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      role={onClick ? "button" : undefined}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      />
    </div>
  );
}
