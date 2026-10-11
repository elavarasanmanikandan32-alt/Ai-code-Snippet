import Link from "next/link";
import {
  Code2,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Terminal,
  Braces,
  Tag,
  Search,
} from "lucide-react";
import { Show } from "@clerk/nextjs";
import { InteractiveSnippetSearch } from "@/components/landing/InteractiveSnippetSearch";

export const dynamic = "force-dynamic";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen grid-bg bg-[#f8fafc] text-slate-900 selection:bg-[#0284c7]/20 selection:text-[#0284c7]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Navigation */}
      <nav
        className="glass-strong sticky top-0 z-50 border-b border-[#0284c7]/15 bg-white/90 backdrop-blur-md"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" className="flex items-center gap-3 text-decoration-none">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "var(--accent-gradient)" }}
            >
              <Code2 size={22} color="white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Snippet<span className="text-[#0284c7]">Vault</span>
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="btn-secondary"
                style={{ padding: "10px 22px" }}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="btn-primary"
                style={{ padding: "10px 24px" }}
              >
                Get Started <ArrowRight size={16} />
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="btn-primary"
                style={{ padding: "10px 24px" }}
              >
                Dashboard <ArrowRight size={16} />
              </Link>
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero Section centered with Flexbox */}
      <section
        className="relative overflow-hidden"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "72px",
          paddingBottom: "80px",
        }}
      >

        {/* Hero Flexbox Center Container */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "1200px",
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Centered Hero Content Block */}
          <div
            style={{
              width: "100%",
              maxWidth: "820px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              marginBottom: "56px",
            }}
          >
            {/* AI Badge */}
            <div
              className="rounded-full shadow-sm border border-[#0284c7]/25 bg-white/90 animate-fade-in-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "8px 20px",
                marginBottom: "24px",
              }}
            >
              <Sparkles size={15} className="text-[#0284c7]" />
              <span className="text-xs md:text-sm font-semibold text-[#0284c7]">
                Powered by Google Gemini AI
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight animate-fade-in-up stagger-1"
              style={{
                width: "100%",
                textAlign: "center",
                marginBottom: "24px",
              }}
            >
              Your AI-Powered{" "}
              <span
                className="bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent"
              >
                Code Vault
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed animate-fade-in-up stagger-2"
              style={{
                width: "100%",
                maxWidth: "680px",
                textAlign: "center",
                marginBottom: "36px",
              }}
            >
              Store, organize, and instantly find your code snippets. AI automatically
              generates tags and summaries so you never lose track of your best code.
            </p>

            {/* CTA Buttons - Centered Flexbox */}
            <div
              className="animate-fade-in-up stagger-3"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "16px",
                width: "100%",
              }}
            >
              <Show when="signed-out">
                <Link
                  href="/sign-up"
                  className="btn-primary"
                  style={{ padding: "14px 34px", fontSize: "16px" }}
                >
                  <Zap size={18} />
                  Start for Free
                </Link>
                <Link
                  href="/sign-in"
                  className="btn-secondary"
                  style={{ padding: "14px 34px", fontSize: "16px" }}
                >
                  <GithubIcon size={18} />
                  Sign in with GitHub
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="btn-primary"
                  style={{ padding: "14px 34px", fontSize: "16px" }}
                >
                  <Zap size={18} />
                  Go to Dashboard
                </Link>
              </Show>
            </div>
          </div>

          {/* Interactive Live Search and Code Preview Showcase - Centered Flexbox */}
          <div
            className="animate-fade-in-up stagger-4"
            style={{
              width: "100%",
              maxWidth: "920px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "40px",
              marginBottom: "64px",
            }}
          >
            <InteractiveSnippetSearch />
          </div>
        </div>
      </section>

      {/* Features Section centered with Flexbox */}
      <section
        className="bg-gradient-to-b from-[#f8fafc] via-[#f0f7ff]/60 to-white"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "96px",
          paddingBottom: "96px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              marginBottom: "64px",
            }}
          >
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900"
              style={{
                width: "100%",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              Everything you need to{" "}
              <span className="text-[#0284c7]">manage code</span>
            </h2>
            <p
              className="text-base md:text-lg text-slate-600"
              style={{
                width: "100%",
                textAlign: "center",
              }}
            >
              Powerful features designed for developers who write a lot of code
            </p>
          </div>

          {/* Features Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
              width: "100%",
              maxWidth: "1100px",
            }}
          >
            {[
              {
                icon: <Sparkles size={24} />,
                title: "AI Auto-Tagging",
                description:
                  "Google Gemini automatically generates relevant tags and a concise summary for every snippet you save.",
                gradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
              },
              {
                icon: <Terminal size={24} />,
                title: "Syntax Highlighting",
                description:
                  "Beautiful code rendering with support for 30+ programming languages. Your code looks as good as it works.",
                gradient: "linear-gradient(135deg, #059669, #34d399)",
              },
              {
                icon: <Search size={24} />,
                title: "Instant Search",
                description:
                  "Find any snippet instantly by searching titles, code content, AI-generated tags, or summaries.",
                gradient: "linear-gradient(135deg, #0284c7, #60a5fa)",
              },
              {
                icon: <Shield size={24} />,
                title: "Secure & Private",
                description:
                  "Your snippets are private by default. Authentication ensures only you can access your code vault.",
                gradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
              },
              {
                icon: <Braces size={24} />,
                title: "30+ Languages",
                description:
                  "From Python and JavaScript to Rust and Go — we support syntax highlighting for all major programming languages.",
                gradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
              },
              {
                icon: <Tag size={24} />,
                title: "Smart Organization",
                description:
                  "Filter by language, search by tag, bookmark favorites — find your code exactly when you need it.",
                gradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="animate-fade-in-up h-full"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className="card border border-[#0284c7]/15 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    textAlign: "center",
                    padding: "36px 28px",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                    style={{
                      background: feature.gradient,
                      marginBottom: "24px",
                    }}
                  >
                    <span style={{ color: "white" }}>{feature.icon}</span>
                  </div>
                  <h3
                    className="text-lg md:text-xl font-bold"
                    style={{
                      width: "100%",
                      textAlign: "center",
                      marginBottom: "14px",
                      color: "#0284c7",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed text-slate-600"
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section centered with Flexbox */}
      <section
        className="bg-white"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "96px",
          paddingBottom: "96px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "880px",
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="card bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0f7ff] border border-[#0284c7]/25 shadow-xl rounded-3xl"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "64px 32px",
            }}
          >
            <h2
              className="text-3xl md:text-4xl font-extrabold text-slate-900"
              style={{
                width: "100%",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              Ready to organize your code?
            </h2>
            <p
              className="text-base md:text-lg text-slate-600 max-w-xl mx-auto"
              style={{
                width: "100%",
                textAlign: "center",
                marginBottom: "36px",
              }}
            >
              Join developers who save time with AI-powered snippet management.
            </p>
            <Show when="signed-out">
              <Link
                href="/sign-up"
                className="btn-primary"
                style={{ padding: "16px 40px", fontSize: "16px" }}
              >
                <Zap size={18} />
                Get Started — It&apos;s Free
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="btn-primary"
                style={{ padding: "16px 40px", fontSize: "16px" }}
              >
                <ArrowRight size={18} />
                Go to Dashboard
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-[#0284c7]/15 bg-[#f8fafc]"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-[#0284c7]" />
            <span className="text-sm font-bold text-slate-800">
              SnippetVault
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 SnippetVault. Built with Next.js, Clerk & Google Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
