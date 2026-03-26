# create-basebolt

> Scaffold a production-ready Next.js SaaS in seconds.

```bash
npx create-basebolt@latest
```

## What it does

Basebolt CLI asks you a few questions about your stack and scaffolds a fully configured Next.js 14 SaaS project — auth, database, dashboard, and marketing site — ready to run with `npm install && npm run dev`.

## Features (Free)

- **Authentication** — NextAuth.js or Clerk, email/password + Google OAuth
- **Database** — Prisma ORM + PostgreSQL schema, migrations, seed scripts
- **App Dashboard** — sidebar, header, settings, profile pages
- **Marketing Site** — Hero, Features, FAQ, Footer
- **Deploy config** — vercel.json, fly.toml, or railway.json
- **Type-safe** — strict TypeScript throughout

## Pro Features (coming soon)

- Stripe billing — subscriptions, webhooks, billing portal
- Email system — 5 transactional templates (Resend)
- Admin panel — user management, feature flags, analytics
- Teams & RBAC — roles, permissions, org management

👉 [basebolt.dev/pro](https://basebolt.dev/pro)

## Usage

```bash
npx create-basebolt@latest
```

Follow the prompts:

1. Project name
2. Free or Pro template
3. Select features
4. Auth provider (NextAuth.js / Clerk)
5. Database (PostgreSQL / PlanetScale / Supabase)
6. Deployment target (Vercel / Railway / Fly.io)

Then:

```bash
cd my-app
npm install
cp .env.example .env.local
npm run dev
```

## Requirements

- Node.js 18+
- npm 7+

## License

MIT — [basebolt.dev](https://basebolt.dev)
