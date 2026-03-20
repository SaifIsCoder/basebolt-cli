import fs from 'fs-extra';
import path from 'path';
import type { CLIAnswers } from './cli.js';

export async function scaffold(projectDir: string, answers: CLIAnswers): Promise<void> {
  await fs.ensureDir(projectDir);

  const hasAuth = answers.auth !== null;
  const hasDatabase = answers.database !== null;
  const hasProtectedPages = hasAuth && (answers.dashboard || answers.stripe || answers.adminPanel);

  await writeFile(projectDir, 'package.json', packageJson(answers));
  await writeFile(projectDir, 'tsconfig.json', tsconfig());
  await writeFile(projectDir, 'next.config.mjs', nextConfig());
  await writeFile(projectDir, 'tailwind.config.ts', tailwindConfig());
  await writeFile(projectDir, 'postcss.config.mjs', postcssConfig());
  await writeFile(projectDir, '.env.example', envExample(answers));
  await writeFile(projectDir, '.gitignore', gitignore());
  await writeFile(projectDir, 'README.md', readme(answers));

  await writeFile(projectDir, 'src/app/layout.tsx', appLayout(answers));
  await writeFile(projectDir, 'src/app/page.tsx', appPage(answers));
  await writeFile(projectDir, 'src/app/globals.css', globalsCss());
  await writeFile(projectDir, 'src/app/not-found.tsx', notFound());
  await writeFile(projectDir, 'src/lib/utils.ts', libUtils());

  if (hasDatabase) {
    await writeFile(projectDir, 'src/lib/db.ts', dbLib());
    await writeFile(projectDir, 'prisma/schema.prisma', prismaSchema(answers));
    await writeFile(projectDir, 'prisma/seed.ts', prismaSeed(answers));
  }

  if (answers.auth === 'nextauth') {
    await writeFile(projectDir, 'src/lib/auth.ts', authLib());
    await writeFile(projectDir, 'src/app/api/auth/[...nextauth]/route.ts', authRoute());
    await writeFile(projectDir, 'src/app/api/register/route.ts', registerRoute());
    await writeFile(projectDir, 'src/types/next-auth.d.ts', authTypes());
    await writeFile(projectDir, 'src/app/(auth)/login/page.tsx', loginPage('nextauth'));
    await writeFile(projectDir, 'src/app/(auth)/register/page.tsx', registerPage('nextauth'));
  } else if (answers.auth === 'clerk') {
    await writeFile(projectDir, 'src/app/(auth)/login/page.tsx', loginPage('clerk'));
    await writeFile(projectDir, 'src/app/(auth)/register/page.tsx', registerPage('clerk'));
  }

  if (hasProtectedPages) {
    await writeFile(projectDir, 'src/middleware.ts', middleware(answers));
  }

  if (answers.dashboard) {
    await writeFile(projectDir, 'src/app/(dashboard)/dashboard/page.tsx', dashboardPage());
    await writeFile(projectDir, 'src/app/(dashboard)/settings/page.tsx', settingsPage());
    await writeFile(projectDir, 'src/components/dashboard/Sidebar.tsx', sidebar(answers));
    await writeFile(projectDir, 'src/components/dashboard/Header.tsx', dashHeader());
  }

  if (answers.marketingSite) {
    await writeFile(projectDir, 'src/components/marketing/Hero.tsx', marketingHero(answers));
    await writeFile(projectDir, 'src/components/marketing/Features.tsx', marketingFeatures());
    await writeFile(projectDir, 'src/components/marketing/Pricing.tsx', marketingPricing());
    await writeFile(projectDir, 'src/components/marketing/Footer.tsx', marketingFooter());
    await writeFile(projectDir, 'src/components/marketing/Navbar.tsx', marketingNavbar(answers));
  }

  if (answers.deployment === 'vercel') {
    await writeFile(projectDir, 'vercel.json', vercelJson());
  } else {
    await writeFile(projectDir, 'railway.json', railwayJson());
  }

  await writeFile(projectDir, 'src/components/ui/button.tsx', uiButton());
  await writeFile(projectDir, 'src/components/ui/input.tsx', uiInput());
  await writeFile(projectDir, 'src/components/ui/card.tsx', uiCard());
}

async function writeFile(base: string, rel: string, content: string) {
  const full = path.join(base, rel);
  await fs.ensureDir(path.dirname(full));
  await fs.writeFile(full, content, 'utf8');
}

function packageJson(a: CLIAnswers): string {
  const dependencies: Record<string, string> = {
    next: '^14.2.0',
    react: '^18.3.0',
    'react-dom': '^18.3.0',
    tailwindcss: '^3.4.0',
    clsx: '^2.1.0',
    'tailwind-merge': '^2.3.0',
    'lucide-react': '^0.400.0',
  };
  const devDependencies: Record<string, string> = {
    typescript: '^5.4.0',
    '@types/node': '^20.0.0',
    '@types/react': '^18.3.0',
    '@types/react-dom': '^18.3.0',
    autoprefixer: '^10.4.0',
    postcss: '^8.4.0',
    tsx: '^4.16.2',
  };
  const scripts: Record<string, string> = { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' };

  if (a.database) {
    dependencies['@prisma/client'] = '^5.15.0';
    devDependencies.prisma = '^5.15.0';
    scripts['db:push'] = 'prisma db push';
    scripts['db:studio'] = 'prisma studio';
    scripts['db:seed'] = 'tsx prisma/seed.ts';
  }
  if (a.auth === 'nextauth') {
    dependencies['next-auth'] = '^4.24.0';
    dependencies['@auth/prisma-adapter'] = '^2.7.2';
    dependencies['bcryptjs'] = '^2.4.3';
  }
  if (a.auth === 'clerk') dependencies['@clerk/nextjs'] = '^5.0.0';

  return JSON.stringify({ name: a.projectName, version: '0.1.0', private: true, scripts, dependencies, devDependencies }, null, 2);
}

function tsconfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      baseUrl: '.',
      plugins: [{ name: 'next' }],
      paths: { '@/*': ['./src/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2);
}



function nextConfig(): string { return `// @ts-check
 
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */
}
 
export default nextConfig
`; }


function tailwindConfig(): string { return `import type { Config } from 'tailwindcss';\nconst config: Config = { darkMode: ['class'], content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { brand: { DEFAULT: '#381932', foreground: '#ffffff' } } } }, plugins: [] };\nexport default config;\n`; }
function postcssConfig(): string { return `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`; }
function envExample(a: CLIAnswers): string {
  const lines = ['APP_URL=http://localhost:3000', ''];
  if (a.database === 'postgresql') lines.push('DATABASE_URL="postgresql://user:password@localhost:5432/mydb"', '');
  if (a.database === 'supabase') lines.push('DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"', '');
  if (a.auth === 'nextauth') lines.push('NEXTAUTH_URL=http://localhost:3000', 'NEXTAUTH_SECRET=replace-me-with-a-long-random-string', '');
  if (a.auth === 'clerk') lines.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=', 'CLERK_SECRET_KEY=', '');
  return lines.join('\n');
}
function gitignore(): string { return `.env\n.env.local\n.env.*.local\nnode_modules/\n.next/\nout/\n.DS_Store\n.vercel\n*.tsbuildinfo\nnext-env.d.ts\n`; }
function readme(a: CLIAnswers): string {
  const authSection = a.auth === 'nextauth'
    ? `## Auth

This starter includes email/password auth with NextAuth.

Seeded admin credentials:
- Email: \`admin@example.com\`
- Password: \`changeme123\`
`
    : a.auth === 'clerk'
      ? `## Auth

This starter uses Clerk for authentication.
`
      : '';

  const databaseSection = a.database
    ? `## Database

\`\`\`bash
npm run db:push
npm run db:seed
\`\`\`
`
    : '';

  return `# ${a.projectName}

Built with Basebolt.

- Auth: ${a.auth ?? 'none'}
- Database: ${a.database ?? 'none'}
- Deployment: ${a.deployment}

## Getting Started

\`\`\`bash
npm install
cp .env.example .env.local
npm run dev
\`\`\`

${databaseSection}
${authSection}`;
}
function appLayout(a: CLIAnswers): string {
  const clerkImport = a.auth === 'clerk' ? `import { ClerkProvider } from '@clerk/nextjs';\n` : '';
  const open = a.auth === 'clerk' ? '<ClerkProvider>' : '';
  const close = a.auth === 'clerk' ? '</ClerkProvider>' : '';
  return `import type { Metadata } from 'next';\nimport type { ReactNode } from 'react';\nimport { Inter } from 'next/font/google';\nimport './globals.css';\n${clerkImport}const inter = Inter({ subsets: ['latin'] });\nexport const metadata: Metadata = { title: '${a.projectName}', description: 'Built with Basebolt' };\nexport default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body className={inter.className}>${open}{children}${close}</body></html>; }\n`;
}
function appPage(a: CLIAnswers): string {
  const href = a.dashboard ? '/dashboard' : a.auth ? '/login' : '/';
  const label = a.dashboard ? 'Go to Dashboard' : a.auth ? 'Sign in' : 'Get Started';
  if (!a.marketingSite) return `import Link from 'next/link';\nexport default function Home() { return <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center"><h1 className="mb-4 text-4xl font-bold">${a.projectName}</h1><Link href="${href}" className="rounded-lg bg-brand px-6 py-3 font-medium text-white hover:opacity-90">${label}</Link></main>; }\n`;
  return `import { Navbar } from '@/components/marketing/Navbar';\nimport { Hero } from '@/components/marketing/Hero';\nimport { Features } from '@/components/marketing/Features';\nimport { Pricing } from '@/components/marketing/Pricing';\nimport { Footer } from '@/components/marketing/Footer';\nexport default function Home() { return <main><Navbar /><Hero /><Features /><Pricing /><Footer /></main>; }\n`;
}
function globalsCss(): string { return `@tailwind base;\n@tailwind components;\n@tailwind utilities;\nbody { margin: 0; }\n`; }
function notFound(): string { return `export default function NotFound() { return <div className="flex min-h-screen items-center justify-center">Not found</div>; }\n`; }
function libUtils(): string { return `import { clsx, type ClassValue } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\nexport function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }\n`; }

function authLib(): string {
  return `import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user?.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as 'USER' | 'ADMIN' | undefined) ?? 'USER';
      }
      return session;
    },
  },
};
`;
}
function authRoute(): string {
  return `import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`;
}
function authTypes(): string {
  return `import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'USER' | 'ADMIN';
    };
  }

  interface User {
    role: 'USER' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'USER' | 'ADMIN';
  }
}
`;
}
function registerRoute(): string {
  return `import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json() as { name?: string; email?: string; password?: string };
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
  }

  const hashedPassword = await hash(password, 10);

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ ok: true });
}
`;
}
function loginPage(provider: NonNullable<CLIAnswers['auth']>): string {
  if (provider === 'clerk') {
    return `import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <SignIn path="/login" routing="path" signUpUrl="/register" />
    </main>
  );
}
`;
  }

  return `'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/dashboard',
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
      return;
    }

    window.location.href = result?.url ?? '/dashboard';
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Sign in</h1>
        <p className="mb-6 text-sm text-gray-500">Use your email and password to continue.</p>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(new FormData(event.currentTarget));
          }}
        >
          <input name="email" type="email" placeholder="you@example.com" className="w-full rounded-lg border px-3 py-2" required />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-lg border px-3 py-2" required />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          No account? <Link href="/register" className="text-brand underline underline-offset-4">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
`;
}
function registerPage(provider: NonNullable<CLIAnswers['auth']>): string {
  if (provider === 'clerk') {
    return `import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <SignUp path="/register" routing="path" signInUrl="/login" />
    </main>
  );
}
`;
  }

  return `'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');

    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    };

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setLoading(false);
      setError(data.error ?? 'Could not create your account.');
      return;
    }

    const result = await signIn('credentials', {
      email: payload.email,
      password: payload.password,
      redirect: false,
      callbackUrl: '/dashboard',
    });

    setLoading(false);

    if (result?.error) {
      setError('Account created, but automatic sign-in failed.');
      return;
    }

    window.location.href = result?.url ?? '/dashboard';
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Create account</h1>
        <p className="mb-6 text-sm text-gray-500">Get your starter app ready in one step.</p>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(new FormData(event.currentTarget));
          }}
        >
          <input name="name" type="text" placeholder="Your name" className="w-full rounded-lg border px-3 py-2" required />
          <input name="email" type="email" placeholder="you@example.com" className="w-full rounded-lg border px-3 py-2" required />
          <input name="password" type="password" placeholder="At least 8 characters" className="w-full rounded-lg border px-3 py-2" required />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Have an account? <Link href="/login" className="text-brand underline underline-offset-4">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
`;
}
function middleware(a: CLIAnswers): string {
  const routes = [...(a.dashboard ? ['/dashboard/:path*', '/settings/:path*'] : []), ...(a.adminPanel ? ['/admin/:path*'] : [])];
  if (a.auth === 'clerk') return `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';\nconst isProtectedRoute = createRouteMatcher([${routes.map((route) => `'${route.replace('/:path*', '(.*)')}'`).join(', ')}]);\nexport default clerkMiddleware((auth, req) => { if (isProtectedRoute(req)) auth().protect(); });\nexport const config = { matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'] };\n`;
  return `export { default } from 'next-auth/middleware';\nexport const config = { matcher: [${routes.map((route) => `'${route}'`).join(', ')}] };\n`;
}
function dbLib(): string { return `import { PrismaClient } from '@prisma/client';\nconst globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };\nexport const db = globalForPrisma.prisma ?? new PrismaClient();\nif (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;\n`; }
function prismaSchema(a: CLIAnswers): string {
  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
`;
}
function prismaSeed(a: CLIAnswers): string {
  const importLine = a.auth === 'nextauth' ? `import { hash } from 'bcryptjs';\n` : '';
  const passwordLine = a.auth === 'nextauth' ? `  const hashedPassword = await hash('changeme123', 10);\n` : '';
  const passwordField = a.auth === 'nextauth' ? `\n      password: hashedPassword,` : '';

  return `import { PrismaClient } from '@prisma/client';
${importLine}const db = new PrismaClient();

async function main() {
${passwordLine}  await db.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',${passwordField}
      role: 'ADMIN',
    },
  });
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
`;
}
function dashboardPage(): string { return `import { Sidebar } from '@/components/dashboard/Sidebar';\nimport { Header } from '@/components/dashboard/Header';\nexport default function DashboardPage() { return <div className="flex h-screen"><Sidebar /><div className="flex flex-1 flex-col overflow-hidden"><Header title="Dashboard" /><main className="flex-1 overflow-y-auto p-6">Dashboard</main></div></div>; }\n`; }
function settingsPage(): string { return `import { Sidebar } from '@/components/dashboard/Sidebar';\nimport { Header } from '@/components/dashboard/Header';\nexport default function SettingsPage() { return <div className="flex h-screen"><Sidebar /><div className="flex flex-1 flex-col overflow-hidden"><Header title="Settings" /><main className="flex-1 overflow-y-auto p-6">Settings</main></div></div>; }\n`; }
function sidebar(a: CLIAnswers): string { const billing = a.stripe ? `  { href: '/billing', label: 'Billing', icon: CreditCard },\n` : ''; return `'use client';\nimport Link from 'next/link';\nimport { usePathname } from 'next/navigation';\nimport { CreditCard, LayoutDashboard, Settings } from 'lucide-react';\nimport { cn } from '@/lib/utils';\nconst links = [\n  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },\n  { href: '/settings', label: 'Settings', icon: Settings },\n${billing}];\nexport function Sidebar() { const pathname = usePathname(); return <aside className="w-60 border-r bg-white flex flex-col"><div className="p-5 border-b"><span className="font-bold text-lg text-brand">Basebolt</span></div><nav className="flex-1 p-3 space-y-1">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', pathname === href ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100')}><Icon className="h-4 w-4" />{label}</Link>)}</nav></aside>; }\n`; }
function dashHeader(): string { return `interface HeaderProps { title: string }\nexport function Header({ title }: HeaderProps) { return <header className="flex h-14 items-center border-b bg-white px-6"><h1 className="text-lg font-semibold">{title}</h1></header>; }\n`; }
function marketingHero(a: CLIAnswers): string { return `export function Hero() { return <section className="flex min-h-screen items-center justify-center">${a.projectName}</section>; }\n`; }
function marketingFeatures(): string { return `export function Features() { return <section id="features" className="px-4 py-24">Features</section>; }\n`; }
function marketingPricing(): string { return `export function Pricing() { return <section id="pricing" className="bg-gray-50 px-4 py-24">Pricing</section>; }\n`; }
function marketingFooter(): string { return `export function Footer() { return <footer className="border-t px-4 py-10 text-center text-sm text-gray-400">Built with Basebolt.</footer>; }\n`; }
function marketingNavbar(a: CLIAnswers): string { const cta = a.auth ? '/login' : a.dashboard ? '/dashboard' : '/'; return `import Link from 'next/link';\nexport function Navbar() { return <nav className="fixed inset-x-0 top-0 z-50 border-b bg-white/80 backdrop-blur-sm"><div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4"><Link href="/" className="font-bold text-brand">Basebolt</Link><Link href="${cta}" className="rounded-lg bg-brand px-4 py-1.5 text-white hover:opacity-90">Open</Link></div></nav>; }\n`; }
function vercelJson(): string { return JSON.stringify({ framework: 'nextjs', buildCommand: 'npm run build', devCommand: 'npm run dev', installCommand: 'npm install' }, null, 2); }
function railwayJson(): string { return JSON.stringify({ build: { builder: 'NIXPACKS' }, deploy: { startCommand: 'npm start', healthcheckPath: '/' } }, null, 2); }
function uiButton(): string { return `import { ButtonHTMLAttributes, forwardRef } from 'react';\nexport const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => <button ref={ref} {...props} />);\nButton.displayName = 'Button';\n`; }
function uiInput(): string { return `import { InputHTMLAttributes, forwardRef } from 'react';\nexport const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => <input ref={ref} {...props} />);\nInput.displayName = 'Input';\n`; }
function uiCard(): string { return `import { HTMLAttributes } from 'react';\nexport function Card(props: HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }\nexport function CardHeader(props: HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }\nexport function CardContent(props: HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }\n`; }

export async function writeConfig(projectDir: string, answers: CLIAnswers): Promise<void> {
  const { projectName, auth, database, dashboard, stripe, email, adminPanel, marketingSite, deployment } = answers;
  const now = new Date().toISOString().split('T')[0];
  const authLabel = auth === 'nextauth' ? 'NextAuth.js' : auth === 'clerk' ? 'Clerk' : 'No';
  const databaseLabel = database === 'postgresql' ? 'PostgreSQL' : database === 'supabase' ? 'Supabase' : 'No';
  const deployMap = { vercel: 'Vercel', railway: 'Railway' } as const;
  const nextSteps = database ? [`1. \`cd ${projectName}\``, '2. `npm install`', '3. `cp .env.example .env.local`', '4. `npm run db:push`', '5. `npm run dev`'] : [`1. \`cd ${projectName}\``, '2. `npm install`', '3. `cp .env.example .env.local`', '4. `npm run dev`'];
  const content = `# Basebolt Configuration\nGenerated: ${now}\n\n## Features Selected\n- Auth: ${authLabel}\n- Database: ${databaseLabel}\n- Dashboard: ${dashboard ? 'Yes' : 'No'}\n- Stripe: ${stripe ? 'Yes' : 'No'}\n- Email: ${email ? 'Yes' : 'No'}\n- Admin Panel: ${adminPanel ? 'Yes' : 'No'}\n- Marketing Site: ${marketingSite ? 'Yes' : 'No'}\n- Deployment: ${deployMap[deployment]}\n\n## Next Steps\n${nextSteps.join('\n')}\n`;
  await fs.writeFile(path.join(projectDir, 'basebolt.config.md'), content, 'utf8');
}
