"use client";

import { usePageTransition } from "./transition-provider";

export function FadeInSection({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { contentReady } = usePageTransition();

  return (
    <div
      className={`fade-section ${className}`}
      data-ready={contentReady}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
