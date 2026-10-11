import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
];

interface SnippetAnalysis {
  tags: string[];
  summary: string;
}

export async function analyzeSnippet(
  code: string,
  language: string
): Promise<SnippetAnalysis> {
  const contents = `You are a code analysis assistant. Analyze the following ${language} code snippet and return a JSON object with:
1. "tags": an array of 3-5 relevant lowercase tags (e.g., "react", "typescript", "async", "api", "hooks"). Tags should describe the technologies, patterns, and concepts used.
2. "summary": a single concise sentence (max 20 words) explaining what this code does.

Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON. No markdown, no explanation.`;

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object" as const,
      properties: {
        tags: {
          type: "array" as const,
          items: { type: "string" as const },
        },
        summary: { type: "string" as const },
      },
      required: ["tags", "summary"],
    },
  };

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      const text = response.text;
      if (!text) continue;

      const parsed: SnippetAnalysis = JSON.parse(text);

      // Validate and sanitize
      return {
        tags: Array.isArray(parsed.tags)
          ? parsed.tags
              .slice(0, 5)
              .map((t) => t.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              .filter(Boolean)
          : [],
        summary:
          typeof parsed.summary === "string"
            ? parsed.summary.slice(0, 200)
            : "AI summary unavailable",
      };
    } catch (error) {
      console.warn(`Model ${model} failed during analysis, trying next model:`, error);
    }
  }

  return {
    tags: [],
    summary: "AI summary unavailable — analysis could not be completed.",
  };
}
