"use client";

export function PageContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen md:ml-24">
      {children}
    </main>
  );
}
