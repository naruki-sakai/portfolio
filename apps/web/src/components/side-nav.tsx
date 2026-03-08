"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageTransition } from "./transition-provider";
import { NAV_ITEMS } from "@/lib/routes";

function isActivePath(href: string, pathname: string) {
  return href === "/"
    ? pathname === "/"
    : pathname.startsWith(href) ||
      (href === "/works" && pathname.startsWith("/projects"));
}

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  pathname: string;
  onClick: (href: string) => void;
}) {
  const isActive = isActivePath(item.href, pathname);
  return (
    <a
      href={item.href}
      onClick={(e) => {
        e.preventDefault();
        onClick(item.href);
      }}
      className={`relative flex items-center gap-2 font-oswald text-sm font-normal tracking-[0.05em] transition-colors hover:text-gray-900 ${
        isActive ? "text-gray-900" : "text-gray-400"
      }`}
    >
      {isActive && (
        <span className="absolute -left-2 h-4 w-0.5 rounded-full bg-gray-900" />
      )}
      {item.label}
    </a>
  );
}

function DesktopNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-36 flex-col items-center justify-center gap-6 md:flex">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          onClick={onNavigate}
        />
      ))}
    </nav>
  );
}

function MobileNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // ページ遷移時にドロワーを閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // body スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNav = useCallback(
    (href: string) => {
      setIsOpen(false);
      // 少し待ってからページ遷移（閉じアニメーション後）
      setTimeout(() => onNavigate(href), 300);
    },
    [onNavigate],
  );

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed right-4 top-4 z-[70] flex h-10 w-10 items-center justify-center"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      >
        <div className="relative h-4 w-5">
          <span
            className={`absolute left-0 h-px w-full bg-gray-900 transition-all duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] ${
              isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-900 transition-all duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] ${
              isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
            }`}
          />
          <span
            className={`absolute left-0 h-px w-full bg-gray-900 transition-all duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] ${
              isOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
            }`}
          />
        </div>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[65] bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <nav
        className={`fixed inset-y-0 right-0 z-[65] flex w-64 flex-col justify-center bg-gray-50/95 backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-8 px-10">
          {NAV_ITEMS.map((item, i) => {
            const isActive = isActivePath(item.href, pathname);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.href);
                }}
                className={`group relative font-oswald text-2xl font-light tracking-[0.08em] transition-all duration-500 ${
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                } ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
                style={{
                  transitionDelay: isOpen ? `${150 + i * 80}ms` : "0ms",
                }}
              >
                {isActive && (
                  <span className="absolute -left-4 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gray-900" />
                )}
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Decorative line */}
        <div
          className={`mx-10 mt-10 h-px bg-gray-200 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            isOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
          }`}
          style={{ transitionDelay: isOpen ? "400ms" : "0ms", transformOrigin: "left" }}
        />
      </nav>
    </div>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const { startPageTransition } = usePageTransition();

  const handleNavigate = useCallback(
    (href: string) => {
      if (pathname !== href) startPageTransition(href);
    },
    [pathname, startPageTransition],
  );

  return (
    <>
      <DesktopNav pathname={pathname} onNavigate={handleNavigate} />
      <MobileNav pathname={pathname} onNavigate={handleNavigate} />
    </>
  );
}
