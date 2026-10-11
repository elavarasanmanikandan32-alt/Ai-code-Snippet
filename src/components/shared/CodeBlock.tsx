"use client";

import { useState, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Play, Loader2 } from "lucide-react";
import { executeCode, type ExecutionResult } from "@/actions/execute";
import { CodeRunnerOutput } from "@/components/dashboard/CodeRunnerOutput";

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  allowRun?: boolean;
}

export function CodeBlock({
  code,
  language,
  showLineNumbers = true,
  allowRun = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    try {
      const res = await executeCode(code, language);
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

  return (
    <div className="flex flex-col">
      <div className="code-block relative group">
        {/* Floating action buttons in top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {allowRun && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              title="Run code to view output"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm transition-all cursor-pointer opacity-90 hover:opacity-100 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" />
                  Run
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 shadow-sm transition-all cursor-pointer opacity-90 hover:opacity-100"
          >
            {copied ? (
              <>
                <Check size={12} className="text-[#38bdf8]" /> Copied!
              </>
            ) : (
              <>
                <Copy size={12} /> Copy
              </>
            )}
          </button>
        </div>

        <SyntaxHighlighter
          language={language === "csharp" ? "clike" : language}
          style={oneDark}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            borderRadius: "12px",
            fontSize: "13px",
            lineHeight: "1.6",
            padding: "20px",
            background: "#1a1a2e",
          }}
          lineNumberStyle={{
            color: "#4a4a6a",
            fontSize: "12px",
            paddingRight: "16px",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Terminal Output */}
      {allowRun && (
        <CodeRunnerOutput
          result={executionResult}
          isRunning={isRunning}
          onRunAgain={handleRun}
          onClear={() => setExecutionResult(null)}
        />
      )}
    </div>
  );
}
