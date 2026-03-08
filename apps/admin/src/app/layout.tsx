import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Admin",
  description: "管理画面",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
