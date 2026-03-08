"use client";

import { usePageTransition } from "./transition-provider";

export function TransitionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { startPageTransition } = usePageTransition();

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        startPageTransition(href);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
