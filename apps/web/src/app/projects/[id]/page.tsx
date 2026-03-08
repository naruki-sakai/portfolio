import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { supabase, CATEGORY_LABELS } from "@portfolio/lib";
import type { Project } from "@portfolio/lib";
import { renderRichContent } from "@/lib/render-rich-content";
import { FadeInSection } from "@/components/fade-in-section";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!data) notFound();

  const project = data as Project;

  return (
    <FadeInSection>
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {project.thumbnail_url && (
          <div className="relative aspect-video">
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6 sm:p-10 lg:px-16">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {CATEGORY_LABELS[project.category]}
          </span>

          {project.site_url && (
            <div className="mt-6">
              <a
                href={project.site_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-gray-900 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-gray-900"
              >
                <ExternalLink size={16} />
                サイトを見る
              </a>
            </div>
          )}

          {project.role && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-500">担当領域</h2>
              <p className="mt-1 text-gray-700">{project.role}</p>
            </div>
          )}

          {project.overview && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-500">概要</h2>
              <p className="mt-1 whitespace-pre-wrap text-gray-700">
                {project.overview}
              </p>
            </div>
          )}

          {project.rich_content && (
            <div className="mt-8">
              <div
                className="rich-content mt-2 text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: renderRichContent(project.rich_content),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </FadeInSection>
  );
}
