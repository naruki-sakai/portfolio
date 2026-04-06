import type { Metadata } from "next";
import { Noto_Sans_JP, Oswald } from "next/font/google";
import { SideNav } from "@/components/side-nav";
import { TransitionProvider } from "@/components/transition-provider";
import { ScrollNavigate } from "@/components/scroll-navigate";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageContent } from "@/components/page-content";
import { NoiseBackground } from "@/components/noise-background";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naruki Sakai｜Portfolio",
  description:
    "Webコーダー/フロントエンドエンジニア 酒井成来のポートフォリオサイト。コーポレートサイト・ECサイト・LPなどの制作実績を掲載しています。",
  openGraph: {
    title: "Naruki Sakai｜Portfolio",
    description:
      "Webコーダー/フロントエンドエンジニア 酒井成来のポートフォリオサイト。コーポレートサイト・ECサイト・LPなどの制作実績を掲載しています。",
    url: "https://naruki-portfolio.vercel.app",
    siteName: "Naruki Sakai｜Portfolio",
    images: [{ url: "/ogp.webp", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`bg-gray-50 ${notoSansJP.variable} ${oswald.variable}`}>
      <body className="min-h-screen text-gray-900 antialiased isolation-isolate">
        <NoiseBackground />
        <TransitionProvider>
          <SideNav />
          <SmoothScroll />
          <ScrollNavigate />
          <PageContent>{children}</PageContent>
        </TransitionProvider>
      </body>
    </html>
  );
}
