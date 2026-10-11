"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSnippet, updateSnippet } from "@/actions/snippets";
import { LANGUAGES } from "@/lib/utils";
import { Save, Loader2, Sparkles, ArrowLeft, Code2, Play } from "lucide-react";
import Link from "next/link";
import { executeCode, type ExecutionResult } from "@/actions/execute";
import { CodeRunnerOutput } from "./CodeRunnerOutput";

interface SnippetFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    content: string;
    language: string;
  };
}

interface HelperFunction {
  label: string;
  snippet: string;
  description: string;
}

const COMMON_HELPERS: Record<string, HelperFunction[]> = {
  python: [
    { label: "len()", snippet: "len()", description: "Length / count of items" },
    { label: "sum()", snippet: "sum()", description: "Sum of numeric elements" },
    { label: "range()", snippet: "range(0, 10)", description: "Generate sequence" },
    { label: "print()", snippet: "print()", description: "Print to console" },
    { label: "map()", snippet: "list(map(lambda x: x * 2, items))", description: "Apply function" },
    { label: "filter()", snippet: "list(filter(lambda x: x > 0, items))", description: "Filter items" },
    { label: "def function", snippet: "def my_function(param):\n    return param", description: "Function definition" },
    { label: "try / except", snippet: "try:\n    pass\nexcept Exception as e:\n    print(e)", description: "Error handling" },
  ],
  javascript: [
    { label: "console.log()", snippet: "console.log();", description: "Log output" },
    { label: ".length", snippet: "items.length", description: "Array/string length" },
    { label: "sum (reduce)", snippet: "items.reduce((acc, curr) => acc + curr, 0)", description: "Sum numbers" },
    { label: ".map()", snippet: "items.map((item) => item)", description: "Transform items" },
    { label: ".filter()", snippet: "items.filter((item) => Boolean(item))", description: "Filter array" },
    { label: "async function", snippet: "async function fetchData() {\n  const res = await fetch(url);\n  return res.json();\n}", description: "Async function" },
  ],
  typescript: [
    { label: "console.log()", snippet: "console.log();", description: "Log output" },
    { label: ".length", snippet: "items.length", description: "Length of array" },
    { label: "sum (reduce)", snippet: "items.reduce<number>((acc, curr) => acc + curr, 0)", description: "Sum typed array" },
    { label: ".map()", snippet: "items.map((item) => item)", description: "Transform items" },
    { label: ".filter()", snippet: "items.filter((item) => Boolean(item))", description: "Filter items" },
    { label: "interface", snippet: "interface Item {\n  id: string;\n  name: string;\n}", description: "Type contract" },
  ],
  rust: [
    { label: ".len()", snippet: ".len()", description: "Vector/slice length" },
    { label: ".iter().sum()", snippet: ".iter().sum::<i32>()", description: "Sum numbers" },
    { label: "println!()", snippet: "println!(\"{}\", val);", description: "Print macro" },
    { label: "vec![]", snippet: "vec![1, 2, 3]", description: "Create vector" },
    { label: "fn function", snippet: "fn my_function(val: i32) -> i32 {\n    val * 2\n}", description: "Function" },
  ],
  sql: [
    { label: "COUNT()", snippet: "COUNT(*)", description: "Total count of records" },
    { label: "SUM()", snippet: "SUM(amount)", description: "Aggregate sum" },
    { label: "AVG()", snippet: "AVG(price)", description: "Average value" },
    { label: "GROUP BY", snippet: "GROUP BY category", description: "Group rows" },
    { label: "ORDER BY", snippet: "ORDER BY id DESC", description: "Sort records" },
  ],
};

export function SnippetForm({ mode, initialData }: SnippetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [language, setLanguage] = useState(initialData?.language || "python");

  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentHelpers = COMMON_HELPERS[language.toLowerCase()] || COMMON_HELPERS.python;

  const handleRunCode = async () => {
    if (!content.trim()) return;
    setIsRunning(true);
    try {
      const res = await executeCode(content, language);
      setExecutionResult(res);
    } catch (err) {
      setExecutionResult({
        success: false,
        stdout: "",
        stderr: err instanceof Error ? err.message : "Execution failed",
        exitCode: 1,
        executionTimeMs: 0,
        runtime: "Error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleInsertHelper = (snippetText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + (prev ? "\n" : "") + snippetText);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;

    const newText = previous.substring(0, start) + snippetText + previous.substring(end);
    setContent(newText);

    // Place cursor right after inserted text
    setTimeout(() => {
      textarea.focus();
      const newPos = start + snippetText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and code content are required.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        if (mode === "edit" && initialData?.id) {
          formData.set("id", initialData.id);
        }
        formData.set("title", title.trim());
        formData.set("content", content);
        formData.set("language", language);

        const res =
          mode === "create"
            ? await createSnippet(formData)
            : await updateSnippet(formData);

        if (!res.success) {
          setError(res.error || "Failed to save snippet.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl text-left">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm mb-6 text-slate-600 hover:text-[#0284c7] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          {mode === "create" ? "Create New Snippet" : "Edit Snippet"}
        </h1>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f7ff] border border-[#0284c7]/20">
          <Sparkles size={14} className="text-[#0284c7]" />
          <span className="text-xs font-semibold text-[#0284c7]">
            AI will auto-generate tags & summary
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Title Field */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-slate-700">
          Snippet Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Python List Calculations (len and sum)"
          className="input"
          required
        />
      </div>

      {/* Language Select */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-slate-700">
          Programming Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="select"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Code Content & Function Autocomplete / Quick Insert Helper */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-700">
            Code Content
          </label>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Code2 size={13} className="text-[#0284c7]" />
            Click helper functions below to insert instantly
          </span>
        </div>

        {/* Quick Function Inserters Toolbar & Quick Run Action */}
        <div className="mb-3 p-3 rounded-xl bg-[#f0f7ff] border border-[#0284c7]/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#0284c7] uppercase tracking-wider mr-1">
              {language} helpers:
            </span>
            {currentHelpers.map((helper) => (
              <button
                key={helper.label}
                type="button"
                onClick={() => handleInsertHelper(helper.snippet)}
                title={helper.description}
                className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-white text-[#0284c7] hover:bg-[#0284c7] hover:text-white border border-[#0284c7]/25 shadow-sm transition-all cursor-pointer"
              >
                + {helper.label}
              </button>
            ))}
          </div>

          {/* Quick Run in Toolbar matching theme */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning || !content.trim()}
            title="Execute code and view output"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer shrink-0 ml-auto"
          >
            {isRunning ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Play size={13} fill="currentColor" />
            )}
            <span>{isRunning ? "Running..." : "Run Code"}</span>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type or paste your code here. Use the quick helper buttons above to insert functions like len() or sum() instantly!"
          className="textarea font-mono"
          style={{ minHeight: "260px" }}
          required
        />

        {/* Live Output Console */}
        <CodeRunnerOutput
          result={executionResult}
          isRunning={isRunning}
          onRunAgain={handleRunCode}
          onClear={() => setExecutionResult(null)}
        />
      </div>

      {/* Action Buttons with equal padding, equal height, and matching Save Snippet theme */}
      <div className="flex items-center gap-4 flex-wrap mt-6 pb-12">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
          style={{
            padding: "12px 28px",
            minHeight: "46px",
            borderRadius: "var(--radius-sm)",
            fontSize: "14px",
            fontWeight: 600,
            opacity: isPending ? 0.7 : 1,
            cursor: isPending ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {mode === "create" ? "Analyzing with AI..." : "Updating..."}
            </>
          ) : (
            <>
              <Save size={16} />
              {mode === "create" ? "Save Snippet" : "Update Snippet"}
            </>
          )}
        </button>

        {/* Primary Run Code Button matching theme and equal padding */}
        <button
          type="button"
          onClick={handleRunCode}
          disabled={isRunning || !content.trim()}
          className="btn-primary"
          style={{
            padding: "12px 28px",
            minHeight: "46px",
            borderRadius: "var(--radius-sm)",
            fontSize: "14px",
            fontWeight: 600,
            opacity: isRunning || !content.trim() ? 0.6 : 1,
            cursor: isRunning || !content.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              Run Code
            </>
          )}
        </button>

        <Link
          href="/dashboard"
          className="btn-secondary"
          style={{
            padding: "12px 28px",
            minHeight: "46px",
            borderRadius: "var(--radius-sm)",
            fontSize: "14px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
