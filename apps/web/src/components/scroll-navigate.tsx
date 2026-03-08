"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePageTransition } from "./transition-provider";
import { ROUTE_ORDER } from "@/lib/routes";

/** 遷移に必要な累積スクロール量（px）— 下方向 */
const DELTA_THRESHOLD_DOWN = 1000;
/** 遷移に必要な累積スクロール量（px）— 上方向（重め） */
const DELTA_THRESHOLD_UP = 1800;
/** 蓄積をリセットするまでの無操作時間（ms） */
const RESET_DELAY = 400;

export function ScrollNavigate() {
  const pathname = usePathname();
  const { startPageTransition, isTransitioning } = usePageTransition();
  const accDownRef = useRef(0);
  const accUpRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;
      if (pathname === "/works") return;

      const { scrollHeight } = document.documentElement;
      const { innerHeight, scrollY } = window;
      const currentIndex = ROUTE_ORDER.indexOf(pathname);
      if (currentIndex === -1) return;

      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        accDownRef.current = 0;
        accUpRef.current = 0;
      }, RESET_DELAY);

      /* --- 下方向: ページ最下部 → 次ページ --- */
      if (e.deltaY > 0) {
        accUpRef.current = 0;
        const atBottom = innerHeight + scrollY >= scrollHeight - 30;
        if (!atBottom) {
          accDownRef.current = 0;
          return;
        }
        accDownRef.current += e.deltaY;
        if (accDownRef.current < DELTA_THRESHOLD_DOWN) return;
        if (currentIndex >= ROUTE_ORDER.length - 1) return;

        accDownRef.current = 0;
        startPageTransition(ROUTE_ORDER[currentIndex + 1]);
        return;
      }

      /* --- 上方向: ページ最上部 → 前ページ --- */
      if (e.deltaY < 0) {
        accDownRef.current = 0;
        const atTop = scrollY <= 30;
        if (!atTop) {
          accUpRef.current = 0;
          return;
        }
        accUpRef.current += Math.abs(e.deltaY);
        if (accUpRef.current < DELTA_THRESHOLD_UP) return;
        if (currentIndex <= 0) return;

        accUpRef.current = 0;
        startPageTransition(ROUTE_ORDER[currentIndex - 1]);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(resetTimerRef.current);
    };
  }, [pathname, isTransitioning, startPageTransition]);

  return null;
}
