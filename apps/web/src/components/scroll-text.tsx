"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TEXT = "SAKAI NARUKI FRONTEND ENGINEER";
const REPEATED = `${TEXT}\u00A0\u00A0\u00A0${TEXT}\u00A0\u00A0\u00A0${TEXT}`;

export function ScrollText() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const el = textRef.current;
    gsap.to(el, {
      x: () => -(el.scrollWidth - window.innerWidth) * 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[10vh] z-0"
      aria-hidden="true"
    >
      <div
        ref={textRef}
        className="whitespace-nowrap font-['Oswald'] font-bold uppercase leading-none text-gray-200"
        style={{
          fontSize: "clamp(100px, 14vw, 260px)",
          letterSpacing: "0.04em",
          opacity: 0.3,
          willChange: "transform",
        }}
      >
        {REPEATED}
      </div>
    </div>
  );
}
