"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@portfolio/lib";
import type { Project } from "@portfolio/lib";
import { AdminHeader } from "@/components/admin-header";
import { ProjectForm } from "@/components/project-form";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (!data) {
        router.replace("/");
        return;
      }
      setProject(data as Project);
      setLoading(false);
    };
    fetch();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <AdminHeader />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <p className="py-12 text-center text-gray-400">読み込み中...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">実績を編集</h1>
        {project && <ProjectForm project={project} />}
      </main>
    </>
  );
}
