"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, FolderOpen } from "lucide-react";
import { supabase } from "@portfolio/lib";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <FolderOpen size={20} />
          Admin
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Projects
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
