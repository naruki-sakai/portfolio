"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Tabs } from "@portfolio/ui";
import type { Project } from "@portfolio/lib";
import { ProjectCard } from "@/components/project-card";

const FILTER_TABS = [
  { key: "all", label: "すべて" },
  { key: "official", label: "オフィシャルサイト" },
  { key: "ec", label: "ECサイト" },
  { key: "lp", label: "LP" },
];

export function ProjectList({ projects }: { projects: Project[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const filtered =
    activeTab === "all"
      ? projects
      : projects.filter((p) => p.category === activeTab);

  const updateProgress = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
  }, []);

  // ホイール縦→横スクロール変換
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();

      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", updateProgress);
    };
  }, [filtered, updateProgress]);

  // フィルタ変更時にスクロール位置リセット
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setProgress(0);
    }
  }, [activeTab]);

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダーバー */}
      <div className="mb-4 flex items-end gap-8 max-md:flex-col max-md:items-start max-md:gap-5">
        <h1 className="text-5xl font-extralight tracking-wide font-oswald">
          Works
        </h1>
        <div className="w-full max-w-[650px] shadow-sm rounded-lg">
          <Tabs tabs={FILTER_TABS} activeKey={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* 横スクロールエリア */}
      {filtered.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-gray-400">
          実績がありません
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="works-scroll-container flex flex-1 items-start pt-16 gap-10 overflow-x-auto overscroll-x-contain max-md:flex-col max-md:items-stretch max-md:overflow-x-visible max-md:overflow-y-auto max-md:gap-6 max-md:pt-4"

        >
          {filtered.map((project, index) => (
            <div
              key={project.id}
              className="works-scroll-card w-[55vw] flex-shrink-0 max-md:w-full max-md:flex-shrink"
            >
              <ProjectCard project={project} />
            </div>
          ))}
          {/* 右端の余白 */}
          <div className="w-4 flex-shrink-0 max-md:hidden" />
        </div>
      )}

      {/* プログレスバー */}
      {filtered.length > 0 && (
        <div className="works-progress -mt-12 mx-auto w-1/2 max-md:hidden">
          <div
            className="works-progress__bar"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      )}
    </div>
  );
}
