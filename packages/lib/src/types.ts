export type Category = "official" | "ec" | "lp";

export interface Project {
  id: string;
  title: string;
  category: Category;
  thumbnail_url: string | null;
  site_url: string | null;
  role: string | null;
  overview: string | null;
  rich_content: Record<string, unknown> | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
