"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Code2,
  LayoutDashboard,
  PlusCircle,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "All Snippets", icon: LayoutDashboard },
  { href: "/dashboard/new", label: "New Snippet", icon: PlusCircle },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 glass-strong flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <Link href="/dashboard" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-gradient)" }}
            >
              <Code2 size={18} color="white" />
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Snippet<span style={{ color: "var(--accent-primary)" }}>Vault</span>
            </span>
          </Link>
          <button
            className="md:hidden btn-icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive
                      ? "rgba(2, 132, 199, 0.1)"
                      : "transparent",
                    color: isActive
                      ? "var(--accent-primary)"
                      : "var(--text-secondary)",
                    border: isActive
                      ? "1px solid rgba(2, 132, 199, 0.2)"
                      : "1px solid transparent",
                    textDecoration: "none",
                  }}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Account
          </span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Top Bar */}
        <div
          className="md:hidden sticky top-0 z-30 glass-strong flex items-center justify-between px-4 py-3"
        >
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <Code2 size={18} style={{ color: "var(--accent-primary)" }} />
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>
              SnippetVault
            </span>
          </Link>
          <UserButton />
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
