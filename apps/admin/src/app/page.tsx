"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { supabase, CATEGORY_LABELS, sortProjects } from "@portfolio/lib";
import type { Project } from "@portfolio/lib";
import { Button } from "@portfolio/ui";
import { AdminHeader } from "@/components/admin-header";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*");
    setProjects(sortProjects((data as Project[]) ?? []));
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const togglePublished = async (project: Project) => {
    await supabase
      .from("projects")
      .update({ is_published: !project.is_published })
      .eq("id", project.id);
    fetchProjects();
  };

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">実績一覧</h1>
          <Link href="/projects/new">
            <Button>
              <Plus size={16} className="mr-1" />
              新規作成
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-400">読み込み中...</p>
        ) : projects.length === 0 ? (
          <p className="py-12 text-center text-gray-400">実績がありません</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">タイトル</th>
                  <th className="px-4 py-3 font-medium">カテゴリ</th>
                  <th className="px-4 py-3 font-medium">公開</th>
                  <th className="px-4 py-3 font-medium">更新日</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {project.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {CATEGORY_LABELS[project.category]}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(project)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {project.is_published ? "公開" : "非公開"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(project.updated_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/projects/${project.id}`}>
                        <Button className="bg-blue-600 text-white hover:bg-blue-700">
                          <Pencil size={14} className="mr-1" />
                          編集
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
