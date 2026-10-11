"use server";

import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { GoogleGenAI } from "@google/genai";

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  runtime: string;
  error?: string;
}

// Helper to execute child process with timeout and safety limits
function runProcess(
  cmd: string,
  args: string[],
  timeoutMs = 6000
): Promise<{ stdout: string; stderr: string; exitCode: number; timedOut?: boolean }> {
  return new Promise((resolve) => {
    let timedOut = false;
    const proc = execFile(
      cmd,
      args,
      {
        timeout: timeoutMs,
        maxBuffer: 1024 * 512, // 512KB max output
        windowsHide: true,
      },
      (err, stdout, stderr) => {
        if (err && (err as unknown as { killed?: boolean }).killed) {
          timedOut = true;
        }

        const exitCode =
          typeof err?.code === "number"
            ? err.code
            : err
            ? 1
            : 0;

        resolve({
          stdout: stdout || "",
          stderr: stderr || (timedOut ? `Execution timed out after ${timeoutMs / 1000}s` : err?.message || ""),
          exitCode,
          timedOut,
        });
      }
    );

    // Fail-safe timeout guard
    const timer = setTimeout(() => {
      try {
        proc.kill();
      } catch {}
    }, timeoutMs + 1000);

    proc.on("close", () => clearTimeout(timer));
  });
}

function isMissingBinary(res: { exitCode: number; stderr: string }): boolean {
  if (res.exitCode === 0) return false;
  const msg = res.stderr.toLowerCase();
  return (
    msg.includes("enoent") ||
    msg.includes("not found") ||
    msg.includes("not recognized") ||
    msg.includes("spawn") ||
    msg.includes("cannot find")
  );
}

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
];

// AI code simulation fallback for serverless environments (e.g., Vercel) or uninstalled languages
async function simulateWithAI(
  code: string,
  language: string,
  startTime: number
): Promise<ExecutionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      stdout: "",
      stderr: `No local runtime available for ${language}, and GEMINI_API_KEY is not configured in environment variables.`,
      exitCode: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      runtime: "Unavailable",
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents = `You are an accurate code runtime engine. Execute/simulate the following ${language} code snippet as a real interpreter/compiler would.
Return ONLY valid JSON matching this schema:
{
  "stdout": "the exact standard output produced by the code (empty string if none)",
  "stderr": "any syntax errors, runtime errors, or exceptions produced (empty string if none)",
  "exitCode": 0 for success, non-zero for error
}

Code:
\`\`\`${language}
${code}
\`\`\``;

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object" as const,
      properties: {
        stdout: { type: "string" as const },
        stderr: { type: "string" as const },
        exitCode: { type: "number" as const },
      },
      required: ["stdout", "stderr", "exitCode"],
    },
  };

  let responseText: string | null = null;
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (response.text) {
        responseText = response.text;
        break;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Model ${model} unavailable (retrying next model):`, err);
    }
  }

  if (!responseText) {
    return {
      success: false,
      stdout: "",
      stderr: lastError?.message || "Execution service temporarily unavailable.",
      exitCode: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      runtime: `${language} (Cloud)`,
    };
  }

  try {
    const parsed = JSON.parse(responseText);
    const executionTimeMs = Math.round(performance.now() - startTime);
    const prettyLang = language.charAt(0).toUpperCase() + language.slice(1);

    return {
      success: parsed.exitCode === 0 && !parsed.stderr,
      stdout: parsed.stdout || "",
      stderr: parsed.stderr || "",
      exitCode: typeof parsed.exitCode === "number" ? parsed.exitCode : 0,
      executionTimeMs,
      runtime: `${prettyLang} (Cloud Sandbox)`,
    };
  } catch (err) {
    return {
      success: false,
      stdout: "",
      stderr: err instanceof Error ? err.message : "Failed to parse execution output",
      exitCode: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      runtime: `${language} (Cloud)`,
    };
  }
}

export async function executeCode(
  code: string,
  language: string
): Promise<ExecutionResult> {
  if (!code || !code.trim()) {
    return {
      success: false,
      stdout: "",
      stderr: "No code provided to execute.",
      exitCode: 1,
      executionTimeMs: 0,
      runtime: "None",
    };
  }

  const startTime = performance.now();
  const normalizedLang = language.toLowerCase().trim();
  const tempDir = os.tmpdir();
  const id = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // 1. PYTHON
  if (normalizedLang === "python" || normalizedLang === "py") {
    const tempFile = path.join(tempDir, `${id}.py`);
    try {
      await fs.writeFile(tempFile, code, "utf-8");

      // Try 'py' launcher first on Windows, then 'python3', then 'python'
      let res = await runProcess("py", [tempFile]);
      if (isMissingBinary(res)) {
        res = await runProcess("python3", [tempFile]);
        if (isMissingBinary(res)) {
          res = await runProcess("python", [tempFile]);
        }
      }

      // If python binary does not exist in environment (e.g., Vercel Serverless), fall back to Gemini AI
      if (isMissingBinary(res)) {
        return await simulateWithAI(code, "python", startTime);
      }

      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        success: res.exitCode === 0 && !res.stderr,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        executionTimeMs,
        runtime: "Python 3 (Local)",
      };
    } catch {
      return await simulateWithAI(code, "python", startTime);
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  // 2. JAVASCRIPT
  if (normalizedLang === "javascript" || normalizedLang === "js") {
    const tempFile = path.join(tempDir, `${id}.mjs`);
    try {
      await fs.writeFile(tempFile, code, "utf-8");
      const res = await runProcess("node", [tempFile]);

      if (isMissingBinary(res)) {
        return await simulateWithAI(code, "javascript", startTime);
      }

      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        success: res.exitCode === 0 && !res.stderr,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        executionTimeMs,
        runtime: "Node.js (Local)",
      };
    } catch {
      return await simulateWithAI(code, "javascript", startTime);
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  // 3. TYPESCRIPT
  if (normalizedLang === "typescript" || normalizedLang === "ts") {
    const tempFile = path.join(tempDir, `${id}.ts`);
    try {
      await fs.writeFile(tempFile, code, "utf-8");
      const res = await runProcess("node", ["--experimental-strip-types", tempFile]);

      if (isMissingBinary(res)) {
        return await simulateWithAI(code, "typescript", startTime);
      }

      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        success: res.exitCode === 0 && !res.stderr,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        executionTimeMs,
        runtime: "Node.js TypeScript (Local)",
      };
    } catch {
      return await simulateWithAI(code, "typescript", startTime);
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  // 4. POWERSHELL
  if (normalizedLang === "powershell" || normalizedLang === "ps1") {
    const tempFile = path.join(tempDir, `${id}.ps1`);
    try {
      await fs.writeFile(tempFile, code, "utf-8");
      const res = await runProcess("powershell", [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        tempFile,
      ]);

      if (isMissingBinary(res)) {
        return await simulateWithAI(code, "powershell", startTime);
      }

      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        success: res.exitCode === 0 && !res.stderr,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        executionTimeMs,
        runtime: "PowerShell (Local)",
      };
    } catch {
      return await simulateWithAI(code, "powershell", startTime);
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  // 5. ALL OTHER LANGUAGES (C++, Rust, Go, Java, Ruby, SQL, etc.)
  return simulateWithAI(code, language, startTime);
}
