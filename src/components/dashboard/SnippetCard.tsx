"use client";

import { Heart, Edit3, Trash2, Eye } from "lucide-react";
import { toggleFavorite, deleteSnippet } from "@/actions/snippets";
import { getLanguageColor, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SnippetCardProps {
  snippet: {
    id: string;
    title: string;
    content: string;
    language: string;
    summary: string | null;
    tags: string[];
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFav, setIsFav] = useState(snippet.isFavorite);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(!isFav);
    await toggleFavorite(snippet.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this snippet?")) return;
    setIsDeleting(true);
    await deleteSnippet(snippet.id);
    router.refresh();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/dashboard/${snippet.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) {
        return;
      }
      e.preventDefault();
      router.push(`/dashboard/${snippet.id}`);
    }
  };

  const langColor = getLanguageColor(snippet.language);
  const previewCode = snippet.content.split("\n").slice(0, 4).join("\n");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="card flex flex-col justify-between h-full p-5 cursor-pointer text-left transition-all duration-300 group"
      style={{ opacity: isDeleting ? 0.5 : 1 }}
    >
      {/* Upper Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base truncate mb-1.5 transition-colors group-hover:text-indigo-400"
              style={{ color: "#0284c7" }}
            >
              {snippet.title}
            </h3>
            <div className="lang-badge inline-flex">
              <span className="dot" style={{ background: langColor }} />
              <span style={{ color: "var(--text-secondary)" }}>
                {snippet.language}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleToggleFavorite}
              className="btn-icon"
              style={{
                width: "32px",
                height: "32px",
                color: isFav ? "#ef4444" : "var(--text-muted)",
                background: isFav ? "rgba(239, 68, 68, 0.1)" : "transparent",
                border: isFav
                  ? "1px solid rgba(239, 68, 68, 0.2)"
                  : "1px solid var(--border-color)",
              }}
              title={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={14} fill={isFav ? "#ef4444" : "none"} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/${snippet.id}/edit`);
              }}
              className="btn-icon"
              style={{ width: "32px", height: "32px" }}
              title="Edit snippet"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="btn-icon"
              style={{
                width: "32px",
                height: "32px",
                color: "var(--text-muted)",
              }}
              title="Delete snippet"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* AI Summary */}
        {snippet.summary && (
          <p
            className="text-sm mb-3 leading-relaxed line-clamp-2"
            style={{ color: "var(--text-secondary)" }}
          >
            ✨ {snippet.summary}
          </p>
        )}

        {/* Code Preview */}
        <div
          className="rounded-lg p-3 mb-3 overflow-hidden flex-1 min-h-[85px] max-h-[110px]"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <pre
            className="text-xs overflow-hidden"
            style={{
              color: "var(--text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {previewCode}
            {snippet.content.split("\n").length > 4 && "\n..."}
          </pre>
        </div>

        {/* Tags */}
        {snippet.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {snippet.tags.map((tag) => (
              <span key={tag} className="tag text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3 mt-auto border-t"
        style={{ borderColor: "var(--border-color)" }}
      >
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {formatDate(snippet.updatedAt)}
        </span>
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--accent-primary)" }}
        >
          <Eye size={12} /> View
        </span>
      </div>
    </div>
  );
}
