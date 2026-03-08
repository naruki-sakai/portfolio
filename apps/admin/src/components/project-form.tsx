"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import {
  supabase,
  CATEGORIES,
  CATEGORY_LABELS,
  getPublicUrl,
  uploadThumbnail,
  uploadWorksImage,
} from "@portfolio/lib";
import type { Project, Category } from "@portfolio/lib";
import { Button } from "@portfolio/ui";
import { RichEditor } from "./rich-editor";

interface ProjectFormProps {
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !project;

  const [title, setTitle] = useState(project?.title ?? "");
  const [category, setCategory] = useState<Category>(
    project?.category ?? "official",
  );
  const [siteUrl, setSiteUrl] = useState(project?.site_url ?? "");
  const [role, setRole] = useState(project?.role ?? "");
  const [overview, setOverview] = useState(project?.overview ?? "");
  const [isPublished, setIsPublished] = useState(
    project?.is_published ?? true,
  );
  const [sortOrder, setSortOrder] = useState(project?.sort_order ?? 0);
  const [isFeatured, setIsFeatured] = useState(project?.is_featured ?? false);
  const [richContent, setRichContent] = useState<Record<
    string,
    unknown
  > | null>(project?.rich_content ?? null);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    project?.thumbnail_url ?? "",
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadThumbnail(file, file.name);
      const url = getPublicUrl(path);
      setThumbnailUrl(url);
    } catch {
      setError("画像のアップロードに失敗しました");
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルは必須です");
      return;
    }
    setError("");
    setSaving(true);

    const payload = {
      title: title.trim(),
      category,
      site_url: siteUrl || null,
      role: role || null,
      overview: overview || null,
      rich_content: richContent ?? null,
      is_published: isPublished,
      is_featured: isFeatured,
      sort_order: sortOrder,
      thumbnail_url: thumbnailUrl || null,
    };

    if (isNew) {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) {
        setError("保存に失敗しました");
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", project.id);
      if (error) {
        setError("保存に失敗しました");
        setSaving(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  };

  const handleRichImageUpload = useCallback(
    async (file: File) => {
      const projectId = project?.id ?? "new";
      try {
        return await uploadWorksImage(file, projectId);
      } catch {
        setError("画像のアップロードに失敗しました");
        throw new Error("upload failed");
      }
    },
    [project?.id],
  );

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm("この実績を削除しますか？")) return;
    await supabase.from("projects").delete().eq("id", project.id);
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          サムネイル画像
        </label>
        <div className="flex items-center gap-4">
          {thumbnailUrl && (
            <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={thumbnailUrl}
                alt="thumbnail"
                fill
                className="object-cover"
              />
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={16} className="mr-1" />
            {uploading ? "アップロード中..." : "画像を選択"}
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          サイトURL
        </label>
        <input
          type="url"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          担当領域
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          概要
        </label>
        <textarea
          value={overview}
          onChange={(e) => setOverview(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          詳細（リッチエディタ）
        </label>
        <RichEditor
          content={richContent}
          onChange={setRichContent}
          onImageUpload={handleRichImageUpload}
        />
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            表示順
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <div className="pt-5">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            公開する
          </label>
        </div>
        <div className="pt-5">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            代表実績
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "保存中..." : isNew ? "作成" : "更新"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/")}
        >
          キャンセル
        </Button>
        {!isNew && (
          <Button type="button" variant="danger" onClick={handleDelete}>
            <Trash2 size={16} className="mr-1" />
            削除
          </Button>
        )}
      </div>
    </form>
  );
}
