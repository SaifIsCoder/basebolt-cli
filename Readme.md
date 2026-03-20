# create-basebolt

> Scaffold a production-ready Next.js SaaS in seconds.

```bash
npx create-basebolt@latest
```

**Basebolt** gives you auth, billing, database, dashboard, and a marketing site — wired together and ready to deploy. Stop rebuilding the same infrastructure on every project.

---

## Quick Start

```bash
npx create-basebolt@latest
```

Answer a few questions, then:

```bash
cd my-app
npm install
cp .env.example .env.local
npm run dev
```

Your SaaS is running at `http://localhost:3000`.

---

## What Gets Scaffolded

### Free (Core — MIT)

| Module | What's included |
|---|---|
| **Authentication** | NextAuth.js or Clerk · email/password · Google OAuth · session management · middleware |
| **Database** | Prisma ORM · PostgreSQL schema · User, Account, Session models · migrations · seed script |
| **App Dashboard** | Sidebar · header · dashboard page · settings page · route-based active nav |
| **Marketing Site** | Navbar · Hero · Features · Footer — real design, ready to customise |
| **UI Components** | Button · Input · Card — typed, variant-aware, shadcn-compatible |
| **Deploy Config** | vercel.json / fly.toml / railway.json · .env.example with all required keys |

### Pro — coming soon

| Module | What's included |
|---|---|
| **Stripe Billing** | Subscriptions · one-time payments · webhook handler · failed payment recovery · billing portal |
| **Email System** | 5 transactional templates — welcome, password reset, invoice, trial ending, receipt (Resend) |
| **Admin Panel** | User list · ban/delete users · feature flags · analytics page |
| **Teams & RBAC** | Roles · permissions · org management · team invite flow |

👉 **[basebolt.vercel.app//pro](https://basebolt.vercel.app//pro)**

---

## CLI Flow

When you run `npx create-basebolt@latest`, the CLI walks you through:

1. **Project name** — names your folder and package.json
2. **Template** — Free (Core) or Pro 🔒
3. **Features** — pick what to include
4. **Auth provider** — NextAuth.js or Clerk
5. **Database** — PostgreSQL / PlanetScale / Supabase
6. **Deployment target** — Vercel / Railway / Fly.io

Total time: under 90 seconds.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript — strict mode |
| Styling | Tailwind CSS + shadcn/ui |
| ORM | Prisma |
| Database | PostgreSQL (Neon / Supabase), PlanetScale |
| Auth | NextAuth.js or Clerk |
| Payments | Stripe (Pro) |
| Email | Resend + React Email (Pro) |
| Deployment | Vercel / Railway / Fly.io |

---

## After Scaffolding

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your keys:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 3. Set up the database

```bash
npm run db:push    # push schema to your database
npm run db:seed    # optional: seed with sample data
npm run db:studio  # open Prisma Studio
```

### 4. Run the dev server

```bash
npm run dev
```

---

## Deployment

### Vercel (recommended)

```bash
npx vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and it deploys automatically on every push.

### Railway

```bash
npx @railway/cli up
```

### Fly.io

```bash
fly launch
fly deploy
```

---

## Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── marketing/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── card.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── utils.ts
│   └── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env.example
├── basebolt.config.md
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Pricing

| Tier | Price | What you get |
|---|---|---|
| **Core** | Free forever (MIT) | Full scaffold — auth, DB, dashboard, marketing site |
| **Solo** | $49 one-time | Everything + Stripe, email, admin panel, magic link |
| **Agency** | $99/month | Everything + white-label, unlimited clients, handoff workflow |

👉 **[basebolt.vercel.app//pro](https://basebolt.vercel.app//pro)**

---

## Requirements

- Node.js 18+
- npm 7+

---

## License

MIT — use it for personal projects, client work, or commercial SaaS products. No strings attached.

---

Built by [Basebolt](https://basebolt.vercel.app/) · **Ship your SaaS in days, not months.**