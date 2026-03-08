import { supabase } from "./supabase";

const BUCKET = "project-thumbnails";
const WORKS_IMAGES_BUCKET = "works-images";

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadThumbnail(
  file: File,
  fileName: string,
): Promise<string> {
  const path = `${Date.now()}_${fileName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteThumbnail(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export async function uploadWorksImage(
  file: File,
  projectId: string,
): Promise<string> {
  const path = `${projectId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from(WORKS_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage
    .from(WORKS_IMAGES_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}
