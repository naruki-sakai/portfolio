"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // worksページでは横スクロールを使用するためLenisを無効化
    if (pathname === "/works") return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const onFrame = (time: DOMHighResTimeStamp) => {
      lenis.raf(time);
      requestAnimationFrame(onFrame);
    };
    requestAnimationFrame(onFrame);

    return () => lenis.destroy();
  }, [pathname]);

  return null;
}
