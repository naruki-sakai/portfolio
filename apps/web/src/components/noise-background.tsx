"use client";

import { useEffect, useRef } from "react";

export function NoiseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 3;
    let animationId: number;
    let stopped = false;

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth / scale);
      canvas.height = Math.ceil(window.innerHeight / scale);
    };

    const drawNoise = () => {
      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const buf = imageData.data;

      for (let i = 0, len = buf.length; i < len; i += 4) {
        const v = (Math.random() * 255) | 0;
        buf[i] = v;
        buf[i + 1] = v;
        buf[i + 2] = v;
        buf[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (stopped) return;
      drawNoise();
      animationId = requestAnimationFrame(loop);
    };

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    resize();

    if (prefersReduced.matches) {
      drawNoise();
    } else {
      loop();
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        stopped = true;
        cancelAnimationFrame(animationId);
        drawNoise();
      } else {
        stopped = false;
        loop();
      }
    };

    prefersReduced.addEventListener("change", onMotionChange);
    window.addEventListener("resize", resize);

    return () => {
      stopped = true;
      cancelAnimationFrame(animationId);
      prefersReduced.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-1] h-full w-full opacity-[0.025]"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
