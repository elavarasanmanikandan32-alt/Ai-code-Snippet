"use client";

import { useState, useMemo } from "react";
import { Search, Sparkles, X, ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/shared/CodeBlock";

interface SampleSnippet {
  id: string;
  title: string;
  language: string;
  langColor: string;
  tags: string[];
  summary: string;
  code: string;
}

const SAMPLE_SNIPPETS: SampleSnippet[] = [
  {
    id: "1",
    title: "Python List Stats: len() and sum()",
    language: "python",
    langColor: "#0284c7",
    tags: ["python", "len", "sum", "statistics", "math"],
    summary: "Computes total count with len() and aggregate summation with sum() to determine average value.",
    code: `# Calculate length, sum, and average of numbers
numbers = [15, 28, 42, 91, 33, 76]

# len() gets the total number of items
total_items = len(numbers)

# sum() calculates the aggregate total
total_sum = sum(numbers)

# compute mathematical average
average = total_sum / total_items

print(f"Items Count: {total_items}")
print(f"Total Sum:   {total_sum}")
print(f"Average:     {average:.2f}")`,
  },
  {
    id: "2",
    title: "Python FastAPI Endpoint with Validation",
    language: "python",
    langColor: "#0284c7",
    tags: ["python", "fastapi", "async", "api", "len"],
    summary: "Asynchronous FastAPI route with length validation using len() and error handling.",
    code: `from fastapi import FastAPI, HTTPException

app = FastAPI(title="SnippetVault API")

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    items = ["PostgreSQL", "Next.js", "Gemini AI", "Prisma"]
    
    # Check bounds using len()
    if item_id >= len(items) or item_id < 0:
        raise HTTPException(status_code=404, detail="Item out of bounds")
        
    return {"id": item_id, "name": items[item_id], "total": len(items)}`,
  },
  {
    id: "3",
    title: "TypeScript / React Custom Hook: useFetch",
    language: "typescript",
    langColor: "#2563eb",
    tags: ["typescript", "react", "hooks", "async"],
    summary: "Production-ready custom React hook with loading, error, and cached response states.",
    code: `import { useState, useEffect } from "react";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) setData(json);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [url]);

  return { data, loading, error };
}`,
  },
  {
    id: "4",
    title: "JavaScript Array Aggregation: sum() & reduce",
    language: "javascript",
    langColor: "#d97706",
    tags: ["javascript", "sum", "reduce", "array", "math"],
    summary: "Modern JavaScript helper to sum array values and compute count using .length.",
    code: `// Array sum and length aggregation
const transactions = [120.50, 45.00, 310.25, 89.99];

// Aggregate sum using reduce
const totalSum = transactions.reduce((acc, curr) => acc + curr, 0);
const itemCount = transactions.length;
const average = totalSum / itemCount;

console.log("Total Count:", itemCount);
console.log("Total Sum:  $", totalSum.toFixed(2));
console.log("Average:    $", average.toFixed(2));`,
  },
  {
    id: "5",
    title: "Rust Vector Length and Iterator sum()",
    language: "rust",
    langColor: "#ea580c",
    tags: ["rust", "len", "sum", "iter", "vector"],
    summary: "Idiomatic Rust code using .len() and .iter().sum() for high-performance calculations.",
    code: `fn main() {
    let scores: Vec<i32> = vec![85, 92, 78, 96, 88];

    // .len() returns the number of elements
    let count: usize = scores.len();

    // .iter().sum() computes the mathematical sum
    let total: i32 = scores.iter().sum();

    println!("Total elements: {}", count);
    println!("Sum of scores:  {}", total);
    println!("Average:        {:.2}", (total as f64) / (count as f64));
}`,
  },
  {
    id: "6",
    title: "SQL Aggregate Stats: COUNT() and SUM()",
    language: "sql",
    langColor: "#059669",
    tags: ["sql", "sum", "count", "database", "analytics"],
    summary: "Standard SQL query calculating total records (count) and total amount (sum) by category.",
    code: `SELECT 
    category,
    COUNT(id) AS total_snippets,          -- similar to len()
    SUM(lines_of_code) AS total_code_lines, -- aggregate sum()
    AVG(lines_of_code) AS avg_lines
FROM snippets
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY category
ORDER BY total_code_lines DESC;`,
  },
];

export function InteractiveSnippetSearch() {
  const [query, setQuery] = useState("");
  const [activeSnippetId, setActiveSnippetId] = useState<string>("1");

  const filteredSnippets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_SNIPPETS;

    return SAMPLE_SNIPPETS.filter((s) => {
      return (
        s.title.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query]);

  // Active snippet to display
  const activeSnippet = useMemo(() => {
    const found = filteredSnippets.find((s) => s.id === activeSnippetId);
    return found || filteredSnippets[0] || SAMPLE_SNIPPETS[0];
  }, [filteredSnippets, activeSnippetId]);

  return (
    <div
      className="card overflow-hidden border border-[#0284c7]/20 shadow-xl bg-white text-left rounded-2xl"
      style={{
        width: "100%",
        maxWidth: "920px",
      }}
    >
      {/* Search Input Bar with generous equal padding */}
      <div
        className="bg-white border-b border-[#0284c7]/15"
        style={{ padding: "24px 28px" }}
      >
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0284c7]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search snippets by language (e.g. Python, SQL, Rust) or function (len, sum)..."
            className="w-full text-slate-800 text-sm md:text-base border border-[#0284c7]/25 bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0284c7] transition-all"
            style={{
              padding: "16px 48px 16px 52px",
              borderRadius: "14px",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Snippet Selector (if multiple matches) with equal padding & spacing */}
      {filteredSnippets.length > 1 && (
        <div
          className="bg-[#f8fafc] border-b border-[#0284c7]/10 flex items-center overflow-x-auto"
          style={{ padding: "16px 28px", gap: "10px" }}
        >
          {filteredSnippets.map((snippet) => {
            const isSelected = snippet.id === activeSnippet.id;
            return (
              <button
                key={snippet.id}
                onClick={() => setActiveSnippetId(snippet.id)}
                className={`text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#0284c7] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-[#0284c7] border border-slate-200 hover:border-[#0284c7]/30"
                }`}
                style={{ padding: "8px 16px" }}
              >
                {snippet.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Snippet Code Display with generous equal padding */}
      {filteredSnippets.length > 0 ? (
        <div
          className="bg-white"
          style={{ padding: "32px 28px" }}
        >
          {/* Snippet Header */}
          <div
            className="flex flex-wrap items-center justify-between gap-4"
            style={{ marginBottom: "20px" }}
          >
            <div>
              <h3 className="text-xl font-bold" style={{ marginBottom: "6px", color: "#0284c7" }}>
                {activeSnippet.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284c7] uppercase">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: activeSnippet.langColor }}
                  />
                  {activeSnippet.language}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeSnippet.code.split("\n").length} lines
                </span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {activeSnippet.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium font-mono"
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: "rgba(2, 132, 199, 0.1)",
                    color: "#0284c7",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* AI Summary Highlight */}
          <div
            className="rounded-xl bg-[#f0f7ff] border border-[#0284c7]/20 flex items-start gap-3"
            style={{
              padding: "16px 20px",
              marginBottom: "24px",
            }}
          >
            <Sparkles size={18} className="text-[#0284c7] mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-[#0284c7]">AI Summary: </span>
              {activeSnippet.summary}
            </p>
          </div>

          {/* Code Block with margin */}
          <div
            className="rounded-xl overflow-hidden shadow-sm border border-slate-200"
            style={{ marginBottom: "24px" }}
          >
            <CodeBlock
              code={activeSnippet.code}
              language={activeSnippet.language}
            />
          </div>

          {/* Footer Link */}
          <div
            className="border-t border-slate-100 flex items-center justify-end"
            style={{
              paddingTop: "16px",
              marginTop: "16px",
            }}
          >
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] transition-colors"
            >
              Save this snippet to your vault <ArrowRight size={14} />
            </a>
          </div>
        </div>
      ) : (
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            No snippets found matching &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Try searching for &ldquo;python&rdquo;, &ldquo;sql&rdquo;, &ldquo;len&rdquo;, or &ldquo;sum&rdquo;.
          </p>
          <button
            onClick={() => setQuery("")}
            className="text-xs font-semibold rounded-lg bg-[#0284c7] text-white hover:bg-[#0369a1] transition-colors"
            style={{ padding: "8px 16px" }}
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
