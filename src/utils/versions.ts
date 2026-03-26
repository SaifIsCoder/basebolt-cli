// Fetches the latest version of each package from the npm registry
// at scaffold time — so the generated package.json is never stale.

const REGISTRY = 'https://registry.npmjs.org';
const PINNED_VERSIONS: Record<string, string> = {
  '@prisma/client': '^5.15.0',
  'prisma': '^5.15.0',
};

async function fetchVersion(pkg: string): Promise<string> {
  if (pkg in PINNED_VERSIONS) {
    return PINNED_VERSIONS[pkg];
  }

  try {
    const res  = await fetch(`${REGISTRY}/${encodeURIComponent(pkg)}/latest`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { version: string };
    return `^${json.version}`;
  } catch {
    // Fall back to a known-good version if registry is unreachable
    return FALLBACKS[pkg] ?? 'latest';
  }
}

// ── Fallback versions (updated periodically) ──────────────────────────
// These are used only when the npm registry is unreachable.
const FALLBACKS: Record<string, string> = {
  'next':                          '^16.2.1',
  'react':                         '^19.2.0',
  'react-dom':                     '^19.2.0',
  '@prisma/client':                '^5.15.0',
  'prisma':                        '^5.15.0',
  'tailwindcss':                   '^4.2.2',
  'clsx':                          '^2.1.0',
  'tailwind-merge':                '^3.5.0',
  'lucide-react':                  '^1.6.0',
  'next-auth':                     '^4.24.0',
  'framer-motion':                 '^12.38.0',
  'zod':                           '^4.3.6',
  'zustand':                       '^4.5.0',
  'recharts':                      '^2.12.0',
  'date-fns':                      '^4.1.0',
  '@tanstack/react-query':         '^5.40.0',
  'stripe':                        '^16.0.0',
  '@lemonsqueezy/lemonsqueezy-js': '^3.3.0',
  'resend':                        '^3.3.0',
  '@react-email/components':       '^0.0.22',
  'nodemailer':                    '^6.9.0',
  '@types/nodemailer':             '^6.4.0',
  'sharp':                         '^0.34.5',
  'gray-matter':                   '^4.0.3',
  'tsx':                           '^4.19.2',
  'typescript':                    '^6.0.2',
  '@types/node':                   '^25.5.0',
  '@types/react':                  '^19.2.14',
  '@types/react-dom':              '^19.2.3',
  'autoprefixer':                  '^10.4.27',
  'postcss':                       '^8.5.8',
  'eslint':                        '^10.1.0',
  'eslint-config-next':            '^16.2.1',
  '@tailwindcss/postcss':          '^4.2.2',
  'sonner':                        '^2.0.7',
  'next-themes':                   '^0.4.6',
  'react-hook-form':               '^7.72.0',
  '@hookform/resolvers':           '^5.2.2',
  '@supabase/supabase-js':         '^2.100.0',
  '@supabase/ssr':                 '^0.9.0',
};

// ── Package groups ────────────────────────────────────────────────────

const BASE_PACKAGES = [
  'next', 'react', 'react-dom',
  'tailwindcss', 'clsx', 'tailwind-merge', 'lucide-react',
  'framer-motion', 'zod', 'date-fns',
];

const BASE_DEV_PACKAGES = [
  'typescript', '@types/node', '@types/react', '@types/react-dom',
  'autoprefixer', 'postcss', 'eslint', 'eslint-config-next', '@tailwindcss/postcss', 'tsx',
];

const AUTH_PACKAGES         = ['next-auth', '@prisma/client', '@auth/prisma-adapter', 'bcryptjs'];
const AUTH_DEV_PACKAGES     = ['@types/bcryptjs'];
const SUPABASE_AUTH_PACKAGES = ['@supabase/supabase-js', '@supabase/ssr'];
const DB_PACKAGES           = ['prisma', '@prisma/client'];
const STRIPE_PACKAGES       = ['stripe'];
const LEMON_PACKAGES        = ['@lemonsqueezy/lemonsqueezy-js'];
const RESEND_PACKAGES       = ['resend', '@react-email/components'];
const NODEMAILER_PACKAGES   = ['nodemailer'];
const NODEMAILER_DEV        = ['@types/nodemailer'];
const DASHBOARD_PACKAGES    = ['recharts', '@tanstack/react-query', 'zustand'];
const BLOG_PACKAGES         = ['gray-matter', 'sharp'];
const TOAST_PACKAGES        = ['sonner'];
const THEME_PACKAGES        = ['next-themes'];
const FORM_PACKAGES         = ['react-hook-form', '@hookform/resolvers'];

// ── Main resolver ─────────────────────────────────────────────────────

export interface ResolvedVersions {
  deps:    Record<string, string>;
  devDeps: Record<string, string>;
}

export interface VersionOptions {
  auth:         boolean;
  supabaseAuth: boolean;
  database:     boolean;
  stripe:       boolean;
  lemon:        boolean;
  resend:       boolean;
  nodemailer:   boolean;
  dashboard:    boolean;
  blog:         boolean;
  toast:        boolean;
  theme:        boolean;
  form:         boolean;
}

export async function resolveVersions(opts: VersionOptions): Promise<ResolvedVersions> {
  // Collect all package names to fetch
  const depsToFetch: string[]    = [...BASE_PACKAGES];
  const devDepsToFetch: string[] = [...BASE_DEV_PACKAGES];

  // Always included
  depsToFetch.push(...TOAST_PACKAGES);
  depsToFetch.push(...THEME_PACKAGES);
  depsToFetch.push(...FORM_PACKAGES);

  if (opts.auth)         depsToFetch.push(...AUTH_PACKAGES);
  if (opts.auth)         devDepsToFetch.push(...AUTH_DEV_PACKAGES);
  if (opts.supabaseAuth) depsToFetch.push(...SUPABASE_AUTH_PACKAGES);
  if (opts.database)     depsToFetch.push(...DB_PACKAGES);
  if (opts.stripe)       depsToFetch.push(...STRIPE_PACKAGES);
  if (opts.lemon)        depsToFetch.push(...LEMON_PACKAGES);
  if (opts.resend)       depsToFetch.push(...RESEND_PACKAGES);
  if (opts.nodemailer)   { depsToFetch.push(...NODEMAILER_PACKAGES); devDepsToFetch.push(...NODEMAILER_DEV); }
  if (opts.dashboard)    depsToFetch.push(...DASHBOARD_PACKAGES);
  if (opts.blog)         depsToFetch.push(...BLOG_PACKAGES);

  // Deduplicate
  const uniqueDeps    = [...new Set(depsToFetch)];
  const uniqueDevDeps = [...new Set(devDepsToFetch)];

  // Fetch all in parallel
  const [depVersions, devDepVersions] = await Promise.all([
    Promise.all(uniqueDeps.map(async (pkg) => [pkg, await fetchVersion(pkg)] as const)),
    Promise.all(uniqueDevDeps.map(async (pkg) => [pkg, await fetchVersion(pkg)] as const)),
  ]);

  return {
    deps:    Object.fromEntries(depVersions),
    devDeps: Object.fromEntries(devDepVersions),
  };
}
