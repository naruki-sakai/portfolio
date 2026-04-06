"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/*  Phase state machine:                                               */
/*    idle → closing → waiting → opening → idle                        */
/* ------------------------------------------------------------------ */

type Phase = "idle" | "closing" | "waiting" | "opening";

const SLAT_COUNT = 16;

interface TransitionContextValue {
  startPageTransition: (path: string) => void;
  isTransitioning: boolean;
  contentReady: boolean;
}

const TransitionContext = createContext<TransitionContextValue>({
  startPageTransition: () => {},
  isTransitioning: false,
  contentReady: true,
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [contentReady, setContentReady] = useState(true);

  const targetPathRef = useRef<string | null>(null);
  const prevPathnameRef = useRef(pathname);

  const slatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fullCurtainRef = useRef<HTMLDivElement>(null);

  const isTransitioning = phase !== "idle";

  /* --- trigger ----------------------------------------------------- */

  const startPageTransition = useCallback(
    (path: string) => {
      if (isTransitioning) return;
      if (path === pathname) return;
      targetPathRef.current = path;
      setPhase("closing");
    },
    [isTransitioning, pathname],
  );

  /* --- GSAP animation on phase change ------------------------------ */

  useEffect(() => {
    const slatElements = slatRefs.current.filter(Boolean) as HTMLDivElement[];
    const curtain = fullCurtainRef.current;
    if (!curtain || slatElements.length === 0) return;

    let tl: gsap.core.Timeline | null = null;

    if (phase === "closing") {
      tl = gsap.timeline({
        onComplete: () => {
          setContentReady(false);
          setPhase("waiting");
          if (targetPathRef.current) {
            router.push(targetPathRef.current);
          }
        },
      });
      // full-curtain には触れない（hidden のまま）
      tl.to(slatElements, {
        scaleY: 1,
        duration: 0.35,
        ease: "power2.inOut",
        stagger: { each: 0.02, from: "end" },
      });
    }

    if (phase === "opening") {
      tl = gsap.timeline({
        onComplete: () => {
          gsap.set(curtain, { visibility: "hidden", y: "0%" });
          setPhase("idle");
          targetPathRef.current = null;
          requestAnimationFrame(() => setContentReady(true));
        },
      });
      // 1. full-curtain を表示（スラットと同色なので視覚的に変化なし）
      tl.set(curtain, { visibility: "visible", y: "0%" });
      // 2. スラットを即リセット（curtain の裏なので見えない）
      tl.set(slatElements, { scaleY: 0 });
      // 3. カーテンを上にスライドして次ページを露出
      tl.to(curtain, {
        y: "-100%",
        duration: 0.45,
        ease: "power3.inOut",
      });
    }

    return () => {
      tl?.kill();
    };
  }, [phase, router]);

  /* --- pathname change → open -------------------------------------- */

  useEffect(() => {
    if (phase === "waiting" && pathname !== prevPathnameRef.current) {
      requestAnimationFrame(() => {
        setPhase("opening");
      });
    }
    prevPathnameRef.current = pathname;
  }, [pathname, phase]);

  /* --- safety timeout ---------------------------------------------- */

  useEffect(() => {
    if (phase === "waiting") {
      const timer = setTimeout(() => setPhase("opening"), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  /* --- render ------------------------------------------------------ */

  return (
    <TransitionContext.Provider
      value={{
        startPageTransition,
        isTransitioning,
        contentReady,
      }}
    >
      {children}

      {/* Slat overlay (PHASE 1: closing) */}
      <div className="slat-overlay">
        {Array.from({ length: SLAT_COUNT }, (_, i) => (
          <div
            key={i}
            className="slat-overlay__bar"
            ref={(el) => {
              slatRefs.current[i] = el;
            }}
          />
        ))}
      </div>

      {/* Full curtain (PHASE 2: opening) */}
      <div className="full-curtain" ref={fullCurtainRef} />
    </TransitionContext.Provider>
  );
}
