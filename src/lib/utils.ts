import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "dart",
  "scala",
  "html",
  "css",
  "scss",
  "sql",
  "graphql",
  "bash",
  "powershell",
  "yaml",
  "json",
  "xml",
  "markdown",
  "dockerfile",
  "terraform",
  "solidity",
  "r",
] as const;

export type Language = (typeof LANGUAGES)[number];

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    javascript: "#f7df1e",
    typescript: "#3178c6",
    python: "#3776ab",
    java: "#ed8b00",
    csharp: "#239120",
    cpp: "#00599c",
    c: "#a8b9cc",
    go: "#00add8",
    rust: "#dea584",
    ruby: "#cc342d",
    php: "#777bb4",
    swift: "#fa7343",
    kotlin: "#7f52ff",
    dart: "#0175c2",
    scala: "#dc322f",
    html: "#e34f26",
    css: "#1572b6",
    scss: "#cf649a",
    sql: "#e38c00",
    graphql: "#e10098",
    bash: "#4eaa25",
    powershell: "#012456",
    yaml: "#cb171e",
    json: "#292929",
    xml: "#f26b00",
    markdown: "#083fa1",
    dockerfile: "#2496ed",
    terraform: "#844fba",
    solidity: "#363636",
    r: "#276dc3",
  };
  return colors[language] || "#6b7280";
}
