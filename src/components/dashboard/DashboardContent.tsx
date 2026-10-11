"use client";

import { useState, useMemo } from "react";
import { SnippetCard } from "./SnippetCard";
import { Search, Filter, PlusCircle, Code2 } from "lucide-react";
import Link from "next/link";
import { LANGUAGES } from "@/lib/utils";

interface Snippet {
  id: string;
  title: string;
  content: string;
  language: string;
  summary: string | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardContentProps {
  snippets: Snippet[];
  showFavoritesOnly?: boolean;
}

export function DashboardContent({ snippets, showFavoritesOnly = false }: DashboardContentProps) {
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("all");

  const filtered = useMemo(() => {
    let result = snippets;

    if (showFavoritesOnly) {
      result = result.filter((s) => s.isFavorite);
    }

    if (filterLang !== "all") {
      result = result.filter((s) => s.language === filterLang);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q) ||
          s.summary?.toLowerCase().includes(q) ||
          s.tags.some((t) => t.includes(q))
      );
    }

    return result;
  }, [snippets, search, filterLang, showFavoritesOnly]);

  // Get unique languages from the user's snippets
  const usedLanguages = useMemo(() => {
    return [...new Set(snippets.map((s) => s.language))].sort();
  }, [snippets]);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {showFavoritesOnly ? "Favorites" : "My Snippets"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {filtered.length} snippet{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link href="/dashboard/new" className="btn-primary">
          <PlusCircle size={16} />
          <span className="hidden sm:inline">New Snippet</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, code, tag, or summary..."
            className="input"
            style={{ paddingLeft: "44px" }}
          />
        </div>
        <div className="relative flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--text-muted)" }} />
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="select"
            style={{ width: "160px" }}
          >
            <option value="all">All Languages</option>
            {(usedLanguages.length > 0 ? usedLanguages : LANGUAGES).map(
              (lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Snippet Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((snippet, i) => (
            <div
              key={snippet.id}
              className="animate-fade-in-up h-full flex flex-col"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <SnippetCard snippet={snippet} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state">
          <div className="icon">
            <Code2 size={36} color="white" />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {search || filterLang !== "all"
              ? "No snippets match your search"
              : showFavoritesOnly
              ? "No favorite snippets yet"
              : "No snippets yet"}
          </h2>
          <p
            className="text-sm mb-6 max-w-md"
            style={{ color: "var(--text-secondary)" }}
          >
            {search || filterLang !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first snippet and let AI organize it for you!"}
          </p>
          {!search && filterLang === "all" && (
            <Link href="/dashboard/new" className="btn-primary">
              <PlusCircle size={16} />
              Create Your First Snippet
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
