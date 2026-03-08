import { supabase, sortProjects } from "@portfolio/lib";
import type { Project } from "@portfolio/lib";
import { ProjectList } from "@/components/project-list";
import { FadeInSection } from "@/components/fade-in-section";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true);
  const projects = sortProjects((data as Project[]) ?? []);

  return (
    <div className="h-screen overflow-hidden pl-24 pr-0 pt-16 pb-10 flex flex-col max-md:h-auto max-md:overflow-visible max-md:pl-4 max-md:pr-4 max-md:pb-24">
      <FadeInSection className="flex-1 min-h-0">
        <ProjectList projects={projects} />
      </FadeInSection>
    </div>
  );
}
