"use client";

import Image from "next/image";
import type { Project } from "@portfolio/lib";
import { usePageTransition } from "./transition-provider";

export function ProjectCard({ project }: { project: Project }) {
  const { startPageTransition } = usePageTransition();

  return (
    <a
      href={`/projects/${project.id}`}
      onClick={(e) => {
        e.preventDefault();
        startPageTransition(`/projects/${project.id}`);
      }}
      className="project-card block"
    >
      <div className="relative aspect-video overflow-hidden shadow-md">
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-gray-300">
            No Image
          </div>
        )}

        {/* ホバーオーバーレイ */}
        <div className="project-card__overlay">
          <h3 className="text-lg font-semibold text-white text-center">
            {project.title}
          </h3>
          <span className="mt-4 inline-block bg-white px-6 py-2 text-sm font-medium text-gray-900">
            View More
          </span>
        </div>
      </div>
    </a>
  );
}
