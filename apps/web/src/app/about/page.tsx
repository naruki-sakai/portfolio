import { ChevronDown } from "lucide-react";
import { RevealCard } from "@/components/flip-card";
import { TransitionLink } from "@/components/transition-link";
import { FadeInSection } from "@/components/fade-in-section";
import { supabase, sortProjects } from "@portfolio/lib";
import type { Project } from "@portfolio/lib";
import { ProjectCard } from "@/components/project-card";
import { ScrollText } from "@/components/scroll-text";

export const dynamic = "force-dynamic";

const HISTORY = [
  {
    period: "2020/03",
    title: "京都産業大学 経済学部　卒業",
    description: "",
  },
  {
    period: "2020/03 - 2021/10",
    title: "和気産業株式会社",
    description:
      "生活関連商品・DIY用品の卸売営業を担当。量販店向けの既存顧客ルート営業を中心に、売場提案や新商品案内、発注調整などを行う。店舗ごとの特性を踏まえた提案を心がけ、継続的な取引関係を構築。顧客要望を正確に把握し、社内外の調整役として対応する中で、課題整理力やコミュニケーション力を培う。",
  },
  {
    period: "2021/11 - 2022/02",
    title: "職業訓練校 Web デザインコース",
    description:
      "HTML / CSS / JavaScript の基礎から、デザインツールの操作まで体系的に学習。Web制作の基礎知識と実装力を身につける。",
  },
  {
    period: "2022/03 - 現在",
    title: "株式会社Green Hill　入社",
    description:
      "Webデザイナーとして入社。デザインおよびコーディングの両方を担当し、コーポレートサイト・ECサイト・LPなどの制作に携わる。\n現在はコーディング業務を中心に、デザインカンプの再現だけでなく、レスポンシブ設計やUIアニメーションの実装まで幅広く対応している。WordPressやShopifyを用いたCMS構築も担当し、更新性や運用面を考慮した実装を行っている。",
  },
];

const SKILLS = [
  {
    icon: "/icons/responsive.svg",
    iconSize: 50,
    title: "レスポンシブ対応",
    description:
      "PCデザインから意図を汲み取り、各デバイスに最適なレイアウトを設計・実装しています。\nvw や cqw を活用し、さまざまなビューポートに柔軟に対応できる構築を心がけています。",
  },
  {
    icon: "/icons/cms.svg",
    title: "CMS構築",
    description:
      "WordPressやShopifyを用い、更新しやすさを考慮した設計・実装を行っています。\n仕様が明確でない場合でも、デザインから構造を整理し、実装観点で提案することがあります。",
  },
  {
    icon: "/icons/interaction.svg",
    title: "UI・インタラクション実装",
    description:
      "JavaScriptやGSAPを用いたUI・インタラクションの実装に対応しています。\n使いやすさを意識し、自然で心地よい動きを設計しています。\n細かな挙動まで丁寧に調整し、全体の体験を整えることを大切にしています。",
  },
  {
    icon: "/icons/rocket.svg",
    title: "モダン技術への取り組み",
    description:
      "Next.js / TypeScript / Supabase などを自主的に学習しています。\n将来的なWebアプリ開発への対応を目指し、継続的に実装・検証を行っています。\n新しい技術にも前向きに取り組んでいます。",
  },
];

async function getFeaturedProjects(): Promise<Project[]> {
  const { data: featured } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .limit(4);

  const result = sortProjects((featured as Project[]) ?? []);

  if (result.length < 4) {
    const featuredIds = result.map((p) => p.id);
    const query = supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", false)
      .order("updated_at", { ascending: false })
      .limit(4 - result.length);

    if (featuredIds.length > 0) {
      query.not("id", "in", `(${featuredIds.join(",")})`);
    }

    const { data: latest } = await query;
    result.push(...((latest as Project[]) ?? []));
  }

  return result;
}

export default async function AboutPage() {
  const projects = await getFeaturedProjects();

  return (
    <>
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        {/* ===== About ===== */}
        <FadeInSection>
          <section>
            <h1 className="text-5xl font-extralight tracking-wide">
              About
            </h1>
            <div className="mt-8 space-y-4 leading-relaxed text-gray-600">
              <p>
                Web制作会社でコーダーとして、コーポレートサイト・ECサイト・LPなど幅広いジャンルの制作に携わってきました。
              </p>
              <p>
                デザインカンプを忠実に再現するだけでなく、アニメーションやインタラクションの実装にも取り組み、ユーザー体験を意識したフロントエンド実装を行っています。
              </p>
              <p>
                現在は業務に加えて、React / Next.js /
                TypeScriptを用いたモダンフロントエンド開発を自主的に学習・実装しています。将来的にはバックエンドの知識も取り入れ、フロントエンドにとどまらず、設計から関われるエンジニアへと成長していきたいと考えています。
              </p>
            </div>
          </section>
        </FadeInSection>

        {/* ===== Profile ===== */}
        <FadeInSection delay={0.1}>
          <section className="mt-24">
            <h2 className="text-2xl">Profile</h2>
            <dl className="mt-8 space-y-4 text-sm">
              {[
                { label: "Name", value: "酒井 成来（Sakai Naruki）" },
                { label: "Location", value: "兵庫県尼崎市" },
                {
                  label: "Role",
                  value: "Web コーダー / フロントエンドエンジニア",
                },
                {
                  label: "Tech Stack",
                  value:
                    "HTML / CSS（SCSS） / JavaScript / jQuery / GSAP / PHP / WordPress / Shopify（Liquid） / React / TypeScript / Next.js",
                },
                {
                  label: "Tools",
                  value:
                    "VS Code / Adobe Illustrator / Adobe Photoshop / Adobe XD / Figma / GitHub / Supabase",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[7rem_1fr] gap-4"
                >
                  <dt className="font-medium text-gray-900">{item.label}</dt>
                  <dd className="text-gray-600">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </FadeInSection>

        {/* ===== My History ===== */}
        <FadeInSection delay={0.2}>
          <section className="mt-24">
            <h2 className="text-2xl">My History</h2>
            <div className="relative mt-8">
              {HISTORY.map((item, i) => (
                <div
                  key={item.period}
                  className="relative pb-10 pl-8 last:pb-0"
                >
                  <span className="absolute left-0 top-1 z-10 h-3 w-3 rounded-full border-2 border-gray-900 bg-white" />
                  <span className="absolute left-[5px] top-1 bottom-0 w-0.5 bg-gray-200" />
                  <p className="text-xs font-bold tracking-wide text-gray-400">
                    {item.period}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed tracking-wide text-gray-500 whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* ===== Skills ===== */}
        <FadeInSection delay={0.3}>
          <section className="mt-24">
            <h2 className="text-2xl">Skills</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {SKILLS.map((group) => (
                <RevealCard
                  key={group.title}
                  icon={group.icon}
                  iconSize={group.iconSize}
                  title={group.title}
                  description={group.description}
                />
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* ===== Works ===== */}
        <FadeInSection delay={0.4}>
          <section className="mt-24">
            <h2 className="text-2xl">Works</h2>
            {projects.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <p className="mt-8 text-sm text-gray-400">実績がありません</p>
            )}
            <div className="mt-24 mb-20 flex flex-col items-center">
              <div className="works-line" />
              <div className="mt-12">
                <TransitionLink
                  href="/works"
                  className="works-btn relative inline-flex items-center justify-center font-oswald px-28 py-7 text-xl font-light text-gray-900"
                >
                  View All Works
                  <span className="works-btn__arrow absolute right-14">
                    <ChevronDown size={28} strokeWidth={1.2} />
                  </span>
                </TransitionLink>
              </div>
            </div>
          </section>
        </FadeInSection>
      </div>

      <ScrollText />
    </>
  );
}
