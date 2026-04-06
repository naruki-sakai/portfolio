"use client";

import dynamic from "next/dynamic";

const ParticleText = dynamic(
  () => import("@/components/particle-text").then((m) => m.ParticleText),
  { ssr: false }
);
const ScrollIndicator = dynamic(
  () => import("@/components/scroll-indicator").then((m) => m.ScrollIndicator),
  { ssr: false }
);

export default function TopPage() {
  const sharedProps = {
    fontFamily: "var(--font-oswald), sans-serif",
    letterSpacing: "0.04em",
    density: 1.6,
    particleSize: 2.5,
    repulsionRadius: 100,
    repulsionStrength: 22,
  } as const;

  return (
    <div className="relative sm:-ml-24 flex min-h-screen w-screen items-center justify-center overflow-hidden">
      {/* Desktop */}
      <div className="hidden sm:block">
        <ParticleText
          text="Naruki Sakai Portfolio"
          fontSize={60}
          {...sharedProps}
        />
      </div>
      {/* Mobile */}
      <div className="block sm:hidden">
        <ParticleText
          text={"Naruki Sakai\nPortfolio"}
          fontSize={44}
          {...sharedProps}
        />
      </div>
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </div>
  );
}
