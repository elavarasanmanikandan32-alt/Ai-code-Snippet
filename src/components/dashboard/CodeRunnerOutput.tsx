"use client";

import { useState } from "react";
import {
  Terminal,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
} from "lucide-react";
import type { ExecutionResult } from "@/actions/execute";

interface CodeRunnerOutputProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  onRunAgain?: () => void;
  onClear?: () => void;
}

export function CodeRunnerOutput({
  result,
  isRunning,
  onRunAgain,
  onClear,
}: CodeRunnerOutputProps) {
  const [copied, setCopied] = useState(false);

  if (!result && !isRunning) {
    return null;
  }

  const handleCopy = () => {
    const text = [result?.stdout, result?.stderr].filter(Boolean).join("\n");
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="my-6 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl animate-fade-in"
      style={{
        background: "#090d16",
        boxShadow: "0 12px 36px rgba(2, 132, 199, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Terminal Top Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Terminal size={15} className="text-[#38bdf8]" />
            <span>Execution Output</span>
          </div>

          {result?.runtime && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-slate-700/70">
              <Cpu size={11} className="text-[#38bdf8]" />
              {result.runtime}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {isRunning ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
              Running...
            </span>
          ) : result ? (
            <>
              {/* Execution time */}
              <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 mr-1 font-mono">
                <Clock size={11} />
                {result.executionTimeMs}ms
              </span>

              {/* Status Badge */}
              {result.exitCode === 0 && !result.stderr ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                  <CheckCircle2 size={12} />
                  Success (0)
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-semibold">
                  <AlertCircle size={12} />
                  Exit Code {result.exitCode}
                </span>
              )}

              {/* Copy output button */}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy output"
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-[#38bdf8]" /> : <Copy size={13} />}
              </button>

              {/* Re-run button */}
              {onRunAgain && (
                <button
                  type="button"
                  onClick={onRunAgain}
                  title="Run code again"
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                </button>
              )}

              {/* Clear button */}
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  title="Clear output"
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Terminal Content Body with comfortable padding & min-height */}
      <div className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto min-h-[130px] max-h-80 select-text flex flex-col justify-start">
        {isRunning ? (
          <div className="flex items-center gap-3 text-slate-400 py-6 my-auto">
            <div className="w-5 h-5 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
            <span className="text-sm">Executing program in isolated sandbox...</span>
          </div>
        ) : (
          <>
            {/* Standard Output */}
            {result?.stdout && (
              <pre className="text-emerald-300 whitespace-pre-wrap break-words font-mono font-medium tracking-wide">
                {result.stdout}
              </pre>
            )}

            {/* Standard Error */}
            {result?.stderr && (
              <div
                className={`p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/50 ${
                  result?.stdout ? "mt-4" : ""
                }`}
              >
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1.5 text-xs">
                  <AlertCircle size={13} />
                  <span>Error Output:</span>
                </div>
                <pre className="text-rose-300 whitespace-pre-wrap break-words font-mono text-xs">
                  {result.stderr}
                </pre>
              </div>
            )}

            {/* No Output Case */}
            {!result?.stdout && !result?.stderr && (
              <span className="text-slate-500 italic my-auto">
                (Program finished with exit code {result?.exitCode} — no output printed to console)
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
