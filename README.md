# Morshed — Executive AI Coaching Platform

**Morshed** is a premium AI-powered executive coaching platform designed for CEOs, founders, and senior managers across the GCC (Gulf Cooperation Council) region. It delivers ICF-aligned coaching methodologies, real-time KPI tracking, and personalized leadership development through an intelligent conversational interface.

Built with modern web technologies and powered by state-of-the-art AI models, Morshed offers 24/7 smart mentoring in **English**, **Arabic**, and **Persian (Farsi)**.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Running Locally](#running-locally)
7. [Building for Production](#building-for-production)
8. [Project Structure](#project-structure)
9. [Key Technologies](#key-technologies)
10. [License](#license)

---

## Features

- **AI Coaching Chat** — Real-time streaming conversations with an AI executive coach. Supports typewriter reveal effects, markdown rendering, voice input (speech-to-text), and text-to-speech output with live captions.
- **Try Free — No Signup** — A public demo mode allowing visitors to experience the coach immediately, with premium animations, feedback reactions, copy/edit actions, and voice features.
- **Multi-Language Support** — Full internationalization for English, Arabic, and Persian (RTL layouts supported).
- **Management Assessment** — A 30-question evaluation across Leadership, Communication, Strategy, Execution, and People dimensions.
- **Smart Progress Tracking** — KPI dashboards, OKRs, experience bank, micro-lessons, and personal notes.
- **Challenge System** — Structured coaching challenges with smart queue management and accountability loops.
- **Export & Reports** — Download conversations as PDF, Word (.doc), or plain text.
- **Subscription Plans** — Tiered access (Free, Basic, Pro, VIP) with feature gating.
- **Premium Visual Design** — Animated brand logo, gold-themed UI, streaming text effects, and coach avatar with halo/waveform animations.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React 19      │────▶│  TanStack Start  │────▶│  AI Gateway     │
│   (Client)      │     │  (SSR + API)     │     │  (LLM Stream)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │                 │
         ▼              ▼                 ▼
  ┌──────────────┐  ┌──────────┐   ┌──────────┐
  │  Supabase    │  │  Auth    │   │  Storage │
  │  (Postgres)  │  │  (OAuth) │   │  (Files) │
  └──────────────┘  └──────────┘   └──────────┘
```

- **Frontend**: React 19 + Tailwind CSS v4 + shadcn/ui
- **Router & SSR**: TanStack Router + TanStack Start (file-based routing)
- **State & Data**: TanStack Query + Supabase (PostgreSQL)
- **AI Integration**: Vercel AI SDK streaming via OpenAI-compatible gateway
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Runtime**: Cloudflare Workers (edge)

---

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** `>= 20` (recommended: use `nvm` or `fnm`)
- **Bun** `>= 1.0` (primary package manager for this project)
- **Git**

Verify your environment:

```bash
node --version   # v20.x or higher
bun --version    # 1.x or higher
```

If you do not have Bun installed:

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via PowerShell)
irm bun.sh/install.ps1 | iex
```

---

## Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd <project-directory>
```

2. **Install dependencies**:

```bash
bun install
```

This installs all runtime and development dependencies defined in `package.json`.

---

## Environment Variables

The application requires the following environment variables. Create a `.env` file in the project root (or copy from the provided template):

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anonymous/public API key |
| `VITE_SUPABASE_PROJECT_ID` | Yes | Supabase project identifier |
| `SUPABASE_URL` | Yes | Server-side Supabase URL |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | Server-side Supabase public key |
| `LOVABLE_API_KEY` | Yes | API key for the AI Gateway (LLM streaming) |

> **Security Note:** `LOVABLE_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **never** be exposed to the client. Only server-side handlers should read these values.

---

## Running Locally

Start the development server with hot reloading:

```bash
bun run dev
```

The application will be available at:

```
http://localhost:3000
```

TanStack Start will auto-generate the route tree (`routeTree.gen.ts`) on first run. You do **not** need to edit that file manually.

### Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server (Vite dev mode) |
| `bun run build` | Build for production |
| `bun run build:dev` | Build in development mode |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint across the codebase |
| `bun run format` | Format all files with Prettier |

---

## Building for Production

```bash
bun run build
```

The build output is optimized for edge deployment (Cloudflare Workers). To preview the production build before deploying:

```bash
bun run preview
```

---

## Project Structure

```
├── src/
│   ├── components/          # Reusable UI components (shadcn/ui + custom)
│   │   ├── animated-logo.tsx
│   │   ├── back-button.tsx
│   │   ├── coach-avatar.tsx
│   │   ├── streaming-markdown.tsx
│   │   └── ui/            # shadcn/ui primitives
│   ├── hooks/             # Custom React hooks
│   │   └── use-smart-auto-scroll.ts
│   ├── integrations/
│   │   ├── supabase/      # Supabase clients (browser + server)
│   │   └── lovable/       # AI Gateway integration
│   ├── lib/               # Core business logic & server functions
│   │   ├── i18n.tsx       # Translation dictionaries (EN / AR / FA)
│   │   ├── auth-context.tsx
│   │   ├── chat.functions.ts
│   │   ├── coaching.functions.ts
│   │   └── feedback.functions.ts
│   ├── routes/            # TanStack file-based routes
│   │   ├── index.tsx      # Landing page (marketing)
│   │   ├── try.tsx        # Try Free — No Signup demo
│   │   ├── login.tsx      # Authentication (sign in)
│   │   ├── signup.tsx     # Authentication (sign up)
│   │   ├── onboarding.tsx # New user onboarding
│   │   ├── _app.tsx       # Authenticated app shell
│   │   ├── _app.chat.$threadId.tsx  # Main chat interface
│   │   ├── _app.dashboard.tsx
│   │   ├── _app.assessment.tsx
│   │   ├── _app.kpi.tsx
│   │   ├── _app.okrs.tsx
│   │   ├── _app.notes.tsx
│   │   ├── _app.lessons.tsx
│   │   ├── _app.experience.tsx
│   │   ├── _app.action-plans.tsx
│   │   ├── _app.decisions.tsx
│   │   ├── _app.reviews.tsx
│   │   ├── _app.risks.tsx
│   │   ├── _app.challenges.tsx
│   │   ├── _app.board.tsx
│   │   ├── _app.coaches.tsx
│   │   ├── _app.settings.tsx
│   │   └── api/           # Server routes (API endpoints)
│   │       ├── chat.ts
│   │       └── public.demo-chat.ts
│   ├── assets/            # Static images & brand assets
│   ├── styles.css          # Global styles & Tailwind v4 tokens
│   ├── router.tsx          # Router configuration
│   └── start.ts            # TanStack Start entry config
├── supabase/
│   ├── migrations/         # Database schema migrations (SQL)
│   └── config.toml         # Supabase local/config
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js      # (legacy — tokens live in styles.css)
└── README.md
```

---

## Key Technologies

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI library |
| [TanStack Start](https://tanstack.com/start) | Full-stack React framework (SSR + API routes) |
| [TanStack Router](https://tanstack.com/router) | File-based, type-safe routing |
| [TanStack Query](https://tanstack.com/query) | Server state management & caching |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible UI primitives |
| [Supabase](https://supabase.com/) | PostgreSQL database, Auth, Storage |
| [Vercel AI SDK](https://sdk.vercel.ai/) | AI streaming, useChat, tool calls |
| [Zod](https://zod.dev/) | Schema validation |
| [Recharts](https://recharts.org/) | Data visualization (KPI dashboards) |

---

## VPN & Regional Accessibility

This application relies on cloud-hosted backend services (AI Gateway, Supabase database) that run on international infrastructure. Depending on your geographic location and local network policies:

- **If you are deploying to or accessing from regions with restricted international connectivity**, you may need a **VPN** or equivalent network tunnel to reach the backend APIs during development and production.
- **For self-hosted deployments**, you can replace the AI Gateway with a local or regional LLM provider and migrate the Supabase database to a regional PostgreSQL instance — in which case no VPN is required.

> The frontend UI itself does not impose any geographic restrictions. Accessibility depends entirely on the backend endpoints you configure.

---

## Designer

**Mahdi Pourabdollah**  
Email: [mahdi.poorabdollah@gmail.com](mailto:mahdi.poorabdollah@gmail.com)

---

## License

© 2026 Morshed — All rights reserved.
