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

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

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

// Fallback to Gemini code simulation if no local runtime exists for this language
async function simulateWithAI(
  code: string,
  language: string,
  startTime: number
): Promise<ExecutionResult> {
  if (!ai) {
    return {
      success: false,
      stdout: "",
      stderr: `No local runtime available for ${language}, and AI key is not configured.`,
      exitCode: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      runtime: "Unavailable",
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are an accurate code runtime simulator. Execute/simulate the following ${language} code snippet as a real interpreter/compiler would.
Return ONLY valid JSON matching this schema:
{
  "stdout": "the exact standard output produced by the code (empty string if none)",
  "stderr": "any syntax errors, runtime errors, or exceptions produced (empty string if none)",
  "exitCode": 0 for success, non-zero for error
}

Code:
\`\`\`${language}
${code}
\`\`\``,
      config: {
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
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      success: parsed.exitCode === 0 && !parsed.stderr,
      stdout: parsed.stdout || "",
      stderr: parsed.stderr || "",
      exitCode: typeof parsed.exitCode === "number" ? parsed.exitCode : 0,
      executionTimeMs,
      runtime: `AI Simulator (${language})`,
    };
  } catch (err) {
    return {
      success: false,
      stdout: "",
      stderr: err instanceof Error ? err.message : "AI simulation failed",
      exitCode: 1,
      executionTimeMs: Math.round(performance.now() - startTime),
      runtime: `AI Simulator (${language})`,
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

      // Try 'py' launcher first on Windows, fallback to 'python'
      let res = await runProcess("py", [tempFile]);
      if (res.exitCode !== 0 && res.stderr.includes("not recognized") || res.stderr.includes("not found")) {
        res = await runProcess("python", [tempFile]);
      }

      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        success: res.exitCode === 0 && !res.stderr,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        executionTimeMs,
        runtime: "Python 3.14 (Local)",
      };
    } catch (err) {
      return {
        success: false,
        stdout: "",
        stderr: err instanceof Error ? err.message : String(err),
        exitCode: 1,
        executionTimeMs: Math.round(performance.now() - startTime),
        runtime: "Python 3 (Local)",
      };
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
      const executionTimeMs = Math.round(performance.now() - startTime);

      return {
        success: res.exitCode === 0 && !res.stderr,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        executionTimeMs,
        runtime: "Node.js (Local)",
      };
    } catch (err) {
      return {
        success: false,
        stdout: "",
        stderr: err instanceof Error ? err.message : String(err),
        exitCode: 1,
        executionTimeMs: Math.round(performance.now() - startTime),
        runtime: "Node.js (Local)",
      };
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  // 3. TYPESCRIPT
  if (normalizedLang === "typescript" || normalizedLang === "ts") {
    const tempFile = path.join(tempDir, `${id}.ts`);
    try {
      await fs.writeFile(tempFile, code, "utf-8");
      // Node 22+ supports TypeScript directly via --experimental-strip-types
      const res = await runProcess("node", ["--experimental-strip-types", tempFile]);
      const executionTimeMs = Math.round(performance.now() - startTime);

      return {
        success: res.exitCode === 0 && !res.stderr,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        executionTimeMs,
        runtime: "Node.js TypeScript (Local)",
      };
    } catch (err) {
      return {
        success: false,
        stdout: "",
        stderr: err instanceof Error ? err.message : String(err),
        exitCode: 1,
        executionTimeMs: Math.round(performance.now() - startTime),
        runtime: "Node.js TypeScript (Local)",
      };
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
      const executionTimeMs = Math.round(performance.now() - startTime);

      return {
        success: res.exitCode === 0 && !res.stderr,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        executionTimeMs,
        runtime: "PowerShell (Local)",
      };
    } catch (err) {
      return {
        success: false,
        stdout: "",
        stderr: err instanceof Error ? err.message : String(err),
        exitCode: 1,
        executionTimeMs: Math.round(performance.now() - startTime),
        runtime: "PowerShell (Local)",
      };
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  // 5. ALL OTHER LANGUAGES (C++, Rust, Go, Java, Ruby, SQL, etc.)
  // Simulated accurately via Gemini AI
  return simulateWithAI(code, language, startTime);
}
