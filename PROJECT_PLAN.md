# 🏗️ Developer Snippet Vault & AI Publisher — Build Plan

## Architecture Overview

```mermaid
graph TD
    subgraph "Frontend (Next.js App Router)"
        A["Landing Page"] --> B["Auth (Clerk)"]
        B --> C["Dashboard"]
        C --> D["Create/Edit Snippet"]
        C --> E["View Snippet"]
        C --> F["Search & Filter"]
    end

    subgraph "Backend (Next.js Server Actions + API Routes)"
        D --> G["Server Action: saveSnippet"]
        G --> H["Gemini API (@google/genai)"]
        H --> I["Auto Tags + Summary"]
        I --> J["Save to Database"]
        E --> K["Server Action: getSnippet"]
        F --> L["Server Action: searchSnippets"]
    end

    subgraph "Infrastructure"
        J --> M["Supabase (PostgreSQL)"]
        K --> M
        L --> M
        B --> N["Clerk Auth"]
    end

    subgraph "Deployment"
        O["Vercel"]
    end
```

---

## Tech Stack (Final Choices)

| Layer            | Technology                        | Why                                                    |
|------------------|-----------------------------------|--------------------------------------------------------|
| **Framework**    | Next.js 14+ (App Router)         | Server Actions, RSC, API routes — all-in-one           |
| **Database**     | Supabase (PostgreSQL)            | Free tier, real-time, easy setup, Row Level Security   |
| **ORM**          | Prisma                           | Type-safe queries, migrations, works great with Supabase |
| **Auth**         | Clerk                            | GitHub/Google/Email login out-of-the-box, generous free tier |
| **AI API**       | `@google/genai` (Gemini API)     | Auto-tagging & summarization                           |
| **Styling**      | Tailwind CSS v3 + shadcn/ui      | Premium UI components, rapid development               |
| **Code Highlight** | `react-syntax-highlighter` or `shiki` | Beautiful code rendering                          |
| **Markdown**     | `react-markdown` + `remark-gfm`  | Render Markdown notes                                  |
| **Deployment**   | Vercel                           | Native Next.js hosting, environment variables, CI/CD   |

---

## Database Schema

```mermaid
erDiagram
    USERS {
        string id PK "Clerk user ID"
        string email
        string name
        string avatarUrl
        datetime createdAt
        datetime updatedAt
    }
    SNIPPETS {
        string id PK "UUID"
        string userId FK "references USERS.id"
        string title
        text content "The code or markdown content"
        string language "e.g. javascript, python, rust"
        text summary "AI-generated 1-sentence summary"
        string[] tags "AI-generated tags array"
        boolean isFavorite "default false"
        datetime createdAt
        datetime updatedAt
    }
    USERS ||--o{ SNIPPETS : "owns"
```

---

## 📋 Step-by-Step Build Plan

### Phase 1 — Project Scaffolding & Configuration
> **Estimated Time: 30–45 min**

| Step | Task | Details |
|------|------|---------|
| 1.1 | **Initialize Next.js project** | `npx -y create-next-app@latest ./` with App Router, TypeScript, Tailwind CSS, ESLint, `src/` directory |
| 1.2 | **Install core dependencies** | `prisma`, `@prisma/client`, `@clerk/nextjs`, `@google/genai`, `react-syntax-highlighter`, `react-markdown`, `remark-gfm`, `lucide-react` |
| 1.3 | **Install shadcn/ui** | `npx -y shadcn@latest init` → add components: Button, Card, Dialog, Input, Textarea, Select, Badge, Dropdown Menu, Tabs, Toast, Skeleton |
| 1.4 | **Set up environment variables** | Create `.env.local` with placeholders for: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `GEMINI_API_KEY` |
| 1.5 | **Configure `.gitignore`** | Ensure `.env.local`, `node_modules`, `.next` are ignored |

---

### Phase 2 — External Services Setup
> **Estimated Time: 20–30 min (manual steps)**

#### 2A — Supabase Database

| Step | Task | Details |
|------|------|---------|
| 2A.1 | Create a **Supabase** project | Go to [supabase.com](https://supabase.com) → New Project → pick a region |
| 2A.2 | Get connection strings | Go to **Settings → Database → Connection String** → copy the **URI** (for `DATABASE_URL`) and **Direct connection** (for `DIRECT_URL`) |
| 2A.3 | Paste into `.env.local` | `DATABASE_URL="postgresql://..."` and `DIRECT_URL="postgresql://..."` |

#### 2B — Clerk Authentication

| Step | Task | Details |
|------|------|---------|
| 2B.1 | Create a **Clerk** application | Go to [clerk.com](https://clerk.com) → Create App → enable **GitHub**, **Google**, and **Email/Password** sign-in methods |
| 2B.2 | Copy API keys | From the Clerk Dashboard → API Keys → copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` |
| 2B.3 | Paste into `.env.local` | Add both keys |

#### 2C — Gemini API Key

| Step | Task | Details |
|------|------|---------|
| 2C.1 | Get a **Gemini API key** | Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → Create API Key |
| 2C.2 | Paste into `.env.local` | `GEMINI_API_KEY="AIza..."` |

---

### Phase 3 — Database & Prisma Setup
> **Estimated Time: 20 min**

| Step | Task | Details |
|------|------|---------|
| 3.1 | **Initialize Prisma** | `npx prisma init` → creates `prisma/schema.prisma` |
| 3.2 | **Define schema** | Create `User` and `Snippet` models (see schema above). Use `@default(uuid())` for IDs, `String[]` for tags |
| 3.3 | **Configure datasource** | Set `provider = "postgresql"`, add `directUrl` for Supabase pooling compatibility |
| 3.4 | **Run migration** | `npx prisma migrate dev --name init` → creates tables in Supabase |
| 3.5 | **Generate client** | `npx prisma generate` → creates typed client |
| 3.6 | **Create Prisma singleton** | `src/lib/prisma.ts` — prevent multiple instances in dev hot-reload |

---

### Phase 4 — Authentication Integration
> **Estimated Time: 30 min**

| Step | Task | Details |
|------|------|---------|
| 4.1 | **Wrap app in `<ClerkProvider>`** | In `src/app/layout.tsx` |
| 4.2 | **Create middleware** | `src/middleware.ts` → protect `/dashboard` and `/api` routes, allow public access to `/`, `/sign-in`, `/sign-up` |
| 4.3 | **Create sign-in/sign-up pages** | `src/app/sign-in/[[...sign-in]]/page.tsx` and `src/app/sign-up/[[...sign-up]]/page.tsx` using Clerk's `<SignIn />` and `<SignUp />` components |
| 4.4 | **Create webhook or sync** | On first login, sync the Clerk user to the `User` table in Supabase via a server action |
| 4.5 | **Test auth flow** | Sign up → Sign in → Verify protected routes redirect properly |

---

### Phase 5 — AI Integration (Gemini Auto-Tagging)
> **Estimated Time: 30 min**

| Step | Task | Details |
|------|------|---------|
| 5.1 | **Create Gemini client** | `src/lib/gemini.ts` — initialize `GoogleGenAI` with API key |
| 5.2 | **Build `analyzeSnippet` function** | Takes `code` + `language` → calls Gemini with a structured prompt → returns `{ tags: string[], summary: string }` |
| 5.3 | **Craft the prompt** | Instruct Gemini to return JSON with exactly 3–5 tags and a 1-sentence summary. Use `responseMimeType: "application/json"` for structured output |
| 5.4 | **Add error handling & fallback** | If Gemini fails, save snippet with `tags: []` and `summary: "AI summary unavailable"` — don't block the save |
| 5.5 | **Test standalone** | Write a quick script to verify Gemini returns valid JSON for sample code |

> [!IMPORTANT]
> The Gemini prompt design is critical. It must return **valid JSON** consistently. We'll use `responseMimeType: "application/json"` and a `responseSchema` to enforce structure.

---

### Phase 6 — Snippet CRUD (Server Actions)
> **Estimated Time: 45 min**

| Step | Task | Details |
|------|------|---------|
| 6.1 | **`createSnippet` action** | Validate input → call `analyzeSnippet()` for AI tags/summary → insert into DB → revalidate dashboard |
| 6.2 | **`getSnippets` action** | Fetch all snippets for the current user, ordered by `updatedAt` desc |
| 6.3 | **`getSnippetById` action** | Fetch single snippet, verify ownership |
| 6.4 | **`updateSnippet` action** | Update fields → optionally re-analyze with Gemini if code content changed |
| 6.5 | **`deleteSnippet` action** | Verify ownership → delete from DB → revalidate |
| 6.6 | **`toggleFavorite` action** | Toggle `isFavorite` boolean |
| 6.7 | **`searchSnippets` action** | Full-text search on title, content, tags, summary |

> [!TIP]
> All server actions will use `auth()` from Clerk to get the current user ID and enforce ownership checks. No snippet is ever accessible by another user.

---

### Phase 7 — UI Design & Pages
> **Estimated Time: 2–3 hours**

#### 7A — Global Layout & Theme

| Step | Task | Details |
|------|------|---------|
| 7A.1 | **Design system** | Dark mode by default, premium color palette (deep navy + electric blue accents), Inter/JetBrains Mono fonts |
| 7A.2 | **Global layout** | Sidebar navigation (Dashboard, Favorites, New Snippet), top bar with user avatar + sign out |
| 7A.3 | **Responsive design** | Mobile-first: collapsible sidebar → bottom nav on mobile |

#### 7B — Landing Page (`/`)

| Step | Task | Details |
|------|------|---------|
| 7B.1 | **Hero section** | Animated gradient background, headline: "Your AI-Powered Code Vault", CTA buttons |
| 7B.2 | **Features section** | 3-column grid showcasing: AI Tagging, Code Highlighting, Instant Search |
| 7B.3 | **Demo preview** | Static mockup of the dashboard with sample snippets |

#### 7C — Dashboard (`/dashboard`)

| Step | Task | Details |
|------|------|---------|
| 7C.1 | **Snippet cards grid** | Card shows: title, language badge, AI tags, summary preview, favorite icon, edit/delete actions |
| 7C.2 | **Search bar** | Real-time filtering by title, tag, or language |
| 7C.3 | **Filter controls** | Filter by language, sort by date/title, show favorites only |
| 7C.4 | **Empty state** | Beautiful illustration + "Create your first snippet" CTA |
| 7C.5 | **Loading skeletons** | Shimmer cards while data loads |

#### 7D — Create/Edit Snippet (`/dashboard/new` & `/dashboard/[id]/edit`)

| Step | Task | Details |
|------|------|---------|
| 7D.1 | **Form fields** | Title input, Language dropdown (30+ options), Code editor (textarea with monospace font or CodeMirror) |
| 7D.2 | **Live preview** | Side-by-side: editor on left, rendered code with syntax highlighting on right |
| 7D.3 | **AI indicator** | "🤖 AI will auto-generate tags & summary" badge below form |
| 7D.4 | **Submit flow** | Show loading spinner → "Analyzing with AI..." → save → redirect to dashboard with toast |

#### 7E — View Snippet (`/dashboard/[id]`)

| Step | Task | Details |
|------|------|---------|
| 7E.1 | **Full code view** | Syntax-highlighted code block with copy button |
| 7E.2 | **AI insights panel** | Display generated tags as badges + summary in a card |
| 7E.3 | **Actions** | Edit, Delete, Toggle Favorite, Copy to Clipboard |
| 7E.4 | **Metadata** | Created date, last updated, language |

---

### Phase 8 — Polish & Micro-Animations
> **Estimated Time: 30 min**

| Step | Task | Details |
|------|------|---------|
| 8.1 | **Page transitions** | Fade-in animations on route change |
| 8.2 | **Card hover effects** | Subtle scale + shadow lift on snippet cards |
| 8.3 | **Toast notifications** | Success/error toasts for all CRUD operations |
| 8.4 | **Loading states** | Skeleton loaders, spinner on form submit |
| 8.5 | **Copy feedback** | "Copied!" tooltip animation on code copy |
| 8.6 | **Glassmorphism** | Frosted glass effect on sidebar + cards |

---

### Phase 9 — Testing & Bug Fixes
> **Estimated Time: 30 min**

| Step | Task | Details |
|------|------|---------|
| 9.1 | **Auth flow** | Sign up → Sign in → Sign out → Protected routes |
| 9.2 | **CRUD flow** | Create → Read → Update → Delete snippets |
| 9.3 | **AI integration** | Verify tags and summary appear after save |
| 9.4 | **Edge cases** | Empty form, very long code, special characters, network errors |
| 9.5 | **Responsive** | Test on mobile, tablet, desktop viewports |

---

### Phase 10 — Deployment to Vercel
> **Estimated Time: 15–20 min**

| Step | Task | Details |
|------|------|---------|
| 10.1 | **Push to GitHub** | `git init` → `git add .` → `git commit` → push to a new GitHub repo |
| 10.2 | **Import into Vercel** | Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo |
| 10.3 | **Configure env variables** | In Vercel Dashboard → Settings → Environment Variables → add all 5 keys from `.env.local` |
| 10.4 | **Deploy** | Click Deploy → Vercel auto-detects Next.js, builds, and deploys |
| 10.5 | **Update Clerk** | Add your Vercel domain to Clerk's **Allowed Origins** |
| 10.6 | **Verify live** | Test all flows on the live URL |
| 10.7 | **Set up custom domain** | (Optional) Add a custom domain in Vercel settings |

---

## 📁 Final Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ClerkProvider
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind + custom styles
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx        # Clerk sign-in page
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx        # Clerk sign-up page
│   └── dashboard/
│       ├── layout.tsx          # Dashboard layout (sidebar + topbar)
│       ├── page.tsx            # Snippet list / dashboard
│       ├── new/
│       │   └── page.tsx        # Create snippet form
│       └── [id]/
│           ├── page.tsx        # View snippet
│           └── edit/
│               └── page.tsx    # Edit snippet form
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── landing/                # Landing page sections
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── SnippetCard.tsx
│   │   ├── SnippetForm.tsx
│   │   ├── SnippetView.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterControls.tsx
│   │   └── Sidebar.tsx
│   └── shared/                 # Shared components
│       ├── CodeBlock.tsx
│       ├── TagBadge.tsx
│       └── LoadingSkeleton.tsx
├── actions/
│   └── snippets.ts             # All server actions
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── gemini.ts               # Gemini AI client + analyzeSnippet()
│   └── utils.ts                # Utility functions
├── middleware.ts                # Clerk auth middleware
└── types/
    └── index.ts                # TypeScript type definitions
prisma/
└── schema.prisma               # Database schema
```

---

## ⏱️ Total Estimated Build Time

| Phase | Time |
|-------|------|
| Phase 1 — Scaffolding | 30–45 min |
| Phase 2 — External Services | 20–30 min |
| Phase 3 — Database & Prisma | 20 min |
| Phase 4 — Authentication | 30 min |
| Phase 5 — AI Integration | 30 min |
| Phase 6 — CRUD Actions | 45 min |
| Phase 7 — UI & Pages | 2–3 hours |
| Phase 8 — Polish | 30 min |
| Phase 9 — Testing | 30 min |
| Phase 10 — Deployment | 15–20 min |
| **Total** | **~6–7 hours** |

---

## 🔑 Environment Variables Checklist

```env
# Supabase (PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk Route Config
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Google Gemini AI
GEMINI_API_KEY="AIza..."
```

> [!CAUTION]
> Never commit `.env.local` to Git. Ensure it's in `.gitignore`. For production, add all variables via the **Vercel Dashboard → Environment Variables**.

---

## ✅ Pre-Build Checklist (What You Need Before I Start Coding)

- [ ] **Supabase account** — [supabase.com](https://supabase.com) (free tier)
- [ ] **Clerk account** — [clerk.com](https://clerk.com) (free tier)
- [ ] **Gemini API key** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier)
- [ ] **Vercel account** — [vercel.com](https://vercel.com) (free tier)
- [ ] **GitHub account** — for pushing code and Vercel deployment
- [ ] **Node.js 18+** installed locally

> [!NOTE]
> All services above have generous free tiers. You won't need to pay anything to build and deploy this project.
