"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Heart,
  Sparkles,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { toggleFavorite, deleteSnippet } from "@/actions/snippets";
import { getLanguageColor, formatDate } from "@/lib/utils";
import { useState } from "react";

interface SnippetViewProps {
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

export function SnippetView({ snippet }: SnippetViewProps) {
  const router = useRouter();
  const [isFav, setIsFav] = useState(snippet.isFavorite);

  const handleToggleFavorite = async () => {
    setIsFav(!isFav);
    await toggleFavorite(snippet.id);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;
    await deleteSnippet(snippet.id);
    router.push("/dashboard");
  };

  const langColor = getLanguageColor(snippet.language);

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-secondary)", textDecoration: "none" }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {snippet.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="lang-badge">
              <span className="dot" style={{ background: langColor }} />
              <span style={{ color: "var(--text-secondary)" }}>
                {snippet.language}
              </span>
            </div>
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Calendar size={12} />
              Created {formatDate(snippet.createdAt)}
            </span>
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <RefreshCw size={12} />
              Updated {formatDate(snippet.updatedAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className="btn-icon"
            style={{
              color: isFav ? "#ef4444" : "var(--text-muted)",
              background: isFav ? "rgba(239, 68, 68, 0.1)" : "transparent",
              border: isFav
                ? "1px solid rgba(239, 68, 68, 0.2)"
                : "1px solid var(--border-color)",
            }}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={16} fill={isFav ? "#ef4444" : "none"} />
          </button>
          <Link
            href={`/dashboard/${snippet.id}/edit`}
            className="btn-secondary"
            style={{ padding: "8px 16px" }}
          >
            <Edit3 size={14} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger"
            style={{ padding: "8px 16px" }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* AI Insights Card */}
      {(snippet.summary || snippet.tags.length > 0) && (
        <div
          className="card mb-6 p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(56, 189, 248, 0.04))",
            border: "1px solid rgba(2, 132, 199, 0.18)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: "var(--accent-primary)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--accent-primary-hover)" }}
            >
              AI Insights
            </span>
          </div>

          {snippet.summary && (
            <p
              className="text-sm mb-4 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {snippet.summary}
            </p>
          )}

          {snippet.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {snippet.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Code Block */}
      <div className="mb-6">
        <h2
          className="text-sm font-medium mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Code
        </h2>
        <CodeBlock code={snippet.content} language={snippet.language} />
      </div>
    </div>
  );
}
