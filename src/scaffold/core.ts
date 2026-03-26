import type { CLIAnswers } from '../cli.js';
import { writeFile } from '../utils/writeFile.js';
import { resolveVersions } from '../utils/versions.js';

export async function scaffoldCore(projectDir: string, a: CLIAnswers): Promise<void> {

  // Fetch latest versions from npm
  const { deps, devDeps } = await resolveVersions({
    auth:         a.auth === 'nextauth',
    supabaseAuth: a.auth === 'supabase',
    database:     true,
    stripe:       a.payment === 'stripe',
    lemon:        a.payment === 'lemonsqueezy',
    resend:       a.email === 'resend',
    nodemailer:   a.email === 'nodemailer',
    dashboard:    false,
    blog:         a.blog,
    toast:        true,
    theme:        true,
    form:         true,
  });

  await writeFile(projectDir, 'package.json',         packageJson(a, deps, devDeps));
  await writeFile(projectDir, 'tsconfig.json',        tsconfig());
  await writeFile(projectDir, 'next.config.mjs',      nextConfig());
  await writeFile(projectDir, 'tailwind.config.ts',   tailwindConfig());
  await writeFile(projectDir, 'postcss.config.mjs',   postcssConfig());
  await writeFile(projectDir, '.env.example',         envExample(a));
  await writeFile(projectDir, '.gitignore',           gitignore());
  await writeFile(projectDir, 'README.md',            readme(a));
  await writeFile(projectDir, 'src/app/layout.tsx',   appLayout(a));
  await writeFile(projectDir, 'src/app/page.tsx',     appPage(a));
  await writeFile(projectDir, 'src/app/globals.css',  globalsCss());
  await writeFile(projectDir, 'src/app/not-found.tsx', notFound());
  await writeFile(projectDir, 'src/app/error.tsx',    errorPage());
  await writeFile(projectDir, 'src/lib/utils.ts',     libUtils());
  await writeFile(projectDir, 'src/types/index.ts',   types());

  // Standalone SEO when blog is not selected
  if (!a.blog) {
    await writeFile(projectDir, 'src/app/sitemap.ts',  standaloneSitemap(a));
    await writeFile(projectDir, 'src/app/robots.ts',   standaloneRobots(a));
  }
}

function packageJson(a: CLIAnswers, deps: Record<string,string>, devDeps: Record<string,string>): string {
  const scripts: Record<string, string> = {
    dev:          'next dev',
    build:        'next build',
    start:        'next start',
    lint:         'next lint',
    'type-check': 'tsc --noEmit',
    postinstall:  'prisma generate',
    'db:generate': 'prisma generate',
    'db:push':    'prisma db push',
    'db:migrate': 'prisma migrate dev',
    'db:studio':  'prisma studio',
    'db:seed':    'tsx prisma/seed.ts',
  };

  return JSON.stringify({
    name: a.projectName,
    version: '0.1.0',
    private: true,
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  }, null, 2);
}

function tsconfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target:            'ES2017',
      lib:               ['dom', 'dom.iterable', 'esnext'],
      allowJs:           true,
      skipLibCheck:      true,
      strict:            true,
      noEmit:            true,
      esModuleInterop:   true,
      module:            'esnext',
      moduleResolution:  'bundler',
      resolveJsonModule: true,
      isolatedModules:   true,
      jsx:               'preserve',
      incremental:       true,
      plugins:           [{ name: 'next' }],
      paths:             { '@/*': ['./src/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2);
}

function nextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co'         },
      { protocol: 'https', hostname: '**.googleapis.com'       },
      { protocol: 'https', hostname: '**.googleusercontent.com'},
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
};

export default nextConfig;
`;
}

function tailwindConfig(): string {
  return `import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand:  { DEFAULT: '#381932', foreground: '#ffffff', light: '#4a2044' },
        accent: { DEFAULT: '#D97706', foreground: '#ffffff' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'ping-slow':  'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;
`;
}

function postcssConfig(): string {
  return `export default {
  plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} },
};
`;
}

function envExample(a: CLIAnswers): string {
  const lines: string[] = [
    '# ── App ──────────────────────────────────────────────────────',
    `NEXT_PUBLIC_APP_URL=http://localhost:3000`,
    `NEXT_PUBLIC_APP_NAME="${a.projectName}"`,
    '',
  ];

  if (a.auth === 'supabase') {
    lines.push('# ── Supabase Auth ────────────────────────────────────────────');
    lines.push('NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co');
    lines.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
    lines.push('SUPABASE_SERVICE_ROLE_KEY=');
    lines.push('');
  } else {
    lines.push('# ── Auth (NextAuth) ──────────────────────────────────────────');
    lines.push('NEXTAUTH_URL=http://localhost:3000');
    lines.push('NEXTAUTH_SECRET=                    # openssl rand -base64 32');
    lines.push('');
    lines.push('# Google OAuth — https://console.cloud.google.com');
    lines.push('GOOGLE_CLIENT_ID=');
    lines.push('GOOGLE_CLIENT_SECRET=');
    lines.push('');
    lines.push('# GitHub OAuth — https://github.com/settings/applications/new');
    lines.push('GITHUB_CLIENT_ID=');
    lines.push('GITHUB_CLIENT_SECRET=');
    lines.push('');
  }

  if (a.database === 'supabase') {
    lines.push('# ── Database (Supabase) ──────────────────────────────────────');
    lines.push('DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres');
    lines.push('DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres');
    if (a.auth !== 'supabase') {
      lines.push('NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co');
      lines.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
      lines.push('SUPABASE_SERVICE_ROLE_KEY=');
    }
    lines.push('');
  } else if (a.database === 'neon') {
    lines.push('# ── Database (Neon) ──────────────────────────────────────────');
    lines.push('DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require');
    lines.push('');
  }

  if (a.magicLink && a.auth === 'nextauth') {
    lines.push('# ── Email (Magic Link) ──────────────────────────────────────');
    lines.push('EMAIL_SERVER_HOST=smtp.resend.com');
    lines.push('EMAIL_SERVER_PORT=465');
    lines.push('EMAIL_SERVER_USER=resend');
    lines.push('EMAIL_SERVER_PASSWORD=re_...');
    lines.push('EMAIL_FROM=noreply@yourdomain.com');
    lines.push('');
  }

  lines.push('# ── Payments (add when ready) ────────────────────────────────');
  lines.push('# STRIPE_SECRET_KEY=sk_test_...');
  lines.push('# STRIPE_WEBHOOK_SECRET=whsec_...');
  lines.push('# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');

  return lines.join('\n');
}

function gitignore(): string {
  return `# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp

# Debug
npm-debug.log*
yarn-debug.log*

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Vercel
.vercel
`;
}

function readme(a: CLIAnswers): string {
  const dbLabel = { supabase: 'Supabase', neon: 'Neon' }[a.database];
  const authLabel = a.auth === 'supabase' ? 'Supabase Auth' : 'NextAuth.js';
  return `# ${a.projectName}

> Built with [Basebolt](https://basebolt.dev) — Ship your SaaS in days, not months.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Auth | ${authLabel} |
| Database | Prisma + ${dbLabel} |
| Deployment | Vercel |

## Quick Start

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your keys

# 3. Set up database
npm run db:push
npm run db:seed

# 4. Start development
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── (marketing)/      # Public marketing pages
│   └── api/              # API routes
├── components/
│   ├── ui/               # Base UI components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   └── marketing/        # Marketing components
├── lib/
│   ├── auth.ts           # Auth config
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Utilities
└── types/                # TypeScript types
\`\`\`

## Database

\`\`\`bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema (development)
npm run db:migrate    # Create migration (production)
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed with sample data
\`\`\`

## Deployment

Push to GitHub and connect at [vercel.com](https://vercel.com), or:
\`\`\`bash
npx vercel
\`\`\`

## Environment Variables

See \`.env.example\` for all required variables with documentation.

---

Scaffolded with [Basebolt CLI](https://basebolt.dev) · [Docs](https://basebolt.dev/docs)
`;
}

function appLayout(a: CLIAnswers): string {
  const providerImport = a.auth === 'supabase'
    ? ''
    : `import { Providers } from '@/components/Providers';`;

  const wrapStart = a.auth === 'supabase'
    ? `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`
    : `<Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`;

  const wrapEnd = a.auth === 'supabase'
    ? `</ThemeProvider>`
    : `</ThemeProvider>
          </Providers>`;

  return `import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
${providerImport}

export const metadata: Metadata = {
  title: {
    default: '${a.projectName}',
    template: \`%s | ${a.projectName}\`,
  },
  description: 'Built with Basebolt',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type:   'website',
    locale: 'en_US',
    url:    process.env.NEXT_PUBLIC_APP_URL,
    siteName: '${a.projectName}',
  },
  twitter: { card: 'summary_large_image' },
  robots:  { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        ${wrapStart}
          {children}
          <Toaster richColors position="bottom-right" />
        ${wrapEnd}
      </body>
    </html>
  );
}
`;
}

function appPage(a: CLIAnswers): string {
  if (!a.marketingSite) {
    return `import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">${a.projectName}</h1>
      <p className="max-w-md text-lg text-gray-500">
        Your SaaS is scaffolded and ready to build.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-xl bg-brand px-6 py-3 font-medium text-white transition hover:opacity-90"
        >
          Go to Dashboard →
        </Link>
        <Link
          href="/login"
          className="rounded-xl border px-6 py-3 font-medium transition hover:bg-gray-50"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
`;
  }
  return `import { Navbar }     from '@/components/marketing/Navbar';
import { Hero }       from '@/components/marketing/Hero';
import { Features }   from '@/components/marketing/Features';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { Pricing }    from '@/components/marketing/Pricing';
import { Faq }        from '@/components/marketing/Faq';
import { CTA }        from '@/components/marketing/CTA';
import { Footer }     from '@/components/marketing/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
`;
}

function globalsCss(): string {
  return `@reference "tailwindcss";

@tailwind base;
@tailwind components;
@tailwind utilities;

@theme {
  --color-background:   hsl(0 0% 100%);
  --color-foreground:   hsl(222 84% 5%);
  --color-card:         hsl(0 0% 100%);
  --color-border:       hsl(214 32% 91%);
  --color-input:        hsl(214 32% 91%);
  --color-ring:         hsl(262 83% 58%);
  --color-brand:        hsl(320 40% 20%);
  --color-accent:       hsl(38 92% 50%);
  --radius:             0.5rem;
}

@layer base {
  :root {
    --background:   0 0% 100%;
    --foreground:   222 84% 5%;
    --card:         0 0% 100%;
    --border:       214 32% 91%;
    --input:        214 32% 91%;
    --ring:         262 83% 58%;
    --radius:       0.5rem;
  }

  .dark {
    --background: 222 84% 5%;
    --foreground: 210 40% 98%;
    --card:       222 47% 11%;
    --border:     217 33% 17%;
    --input:      217 33% 17%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground antialiased; }
  h1, h2, h3, h4, h5, h6 { @apply font-semibold tracking-tight; }
}

@layer utilities {
  .text-balance { text-wrap: balance; }
  .gradient-brand {
    @apply bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent;
  }
}
`;
}

function notFound(): string {
  return `import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page Not Found' };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-8xl font-black text-gray-200 dark:text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-brand px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}
`;
}

function errorPage(): string {
  return `'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-gray-500">{error.message || 'An unexpected error occurred.'}</p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl bg-brand px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
`;
}

function libUtils(): string {
  return `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency,
  }).format(amount / 100);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? \`\${str.substring(0, length)}...\` : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function absoluteUrl(path: string): string {
  return \`\${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}\${path}\`;
}
`;
}

function types(): string {
  return `// ── Shared TypeScript types ───────────────────────────────────────────

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id:            string;
  name:          string | null;
  email:         string;
  emailVerified: Date | null;
  image:         string | null;
  role:          UserRole;
  createdAt:     Date;
  updatedAt:     Date;
}

export interface ApiResponse<T = unknown> {
  data?:    T;
  error?:   string;
  message?: string;
}

export type NavLink = {
  name:  string;
  href:  string;
  icon?: React.ComponentType<{ className?: string }>;
};
`;
}

function standaloneSitemap(a: CLIAnswers): string {
  const base = `https://${a.projectName}.vercel.app`;
  return `import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '${base}';

  return [
    { url: baseUrl,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0  },
    { url: \`\${baseUrl}/login\`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5  },
    { url: \`\${baseUrl}/register\`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5  },
  ];
}
`;
}

function standaloneRobots(a: CLIAnswers): string {
  const base = `https://${a.projectName}.vercel.app`;
  return `import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '${base}';
  return {
    rules: [
      {
        userAgent: '*',
        allow:    '/',
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
    ],
    sitemap: \`\${baseUrl}/sitemap.xml\`,
  };
}
`;
}
