import type { Category } from "./types";

export const CATEGORY_LABELS: Record<Category, string> = {
  official: "オフィシャルサイト",
  ec: "ECサイト",
  lp: "LP",
};

export const CATEGORIES: Category[] = ["official", "ec", "lp"];
