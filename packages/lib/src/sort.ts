import type { Project } from "./types";

/**
 * sort_order > 0 を昇順で先に、sort_order === 0 を末尾に updated_at 降順で並べる
 */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const aHasOrder = a.sort_order > 0 ? 0 : 1;
    const bHasOrder = b.sort_order > 0 ? 0 : 1;
    if (aHasOrder !== bHasOrder) return aHasOrder - bHasOrder;
    if (aHasOrder === 0) return a.sort_order - b.sort_order;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
