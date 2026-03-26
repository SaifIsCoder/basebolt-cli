import type { CLIAnswers } from '../cli.js';
import { writeFile } from '../utils/writeFile.js';

export async function scaffoldMarketing(projectDir: string, a: CLIAnswers): Promise<void> {
  await writeFile(projectDir, 'src/components/marketing/Navbar.tsx',     navbar());
  await writeFile(projectDir, 'src/components/marketing/Hero.tsx',       hero(a));
  await writeFile(projectDir, 'src/components/marketing/Features.tsx',   features());
  await writeFile(projectDir, 'src/components/marketing/HowItWorks.tsx', howItWorks());
  await writeFile(projectDir, 'src/components/marketing/Pricing.tsx',    pricing());
  await writeFile(projectDir, 'src/components/marketing/Faq.tsx',        faq());
  await writeFile(projectDir, 'src/components/marketing/CTA.tsx',        cta());
  await writeFile(projectDir, 'src/components/marketing/Footer.tsx',     footer());
}

function navbar(): string {
  return `import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-brand">Basebolt</Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/login" className="rounded-lg bg-brand px-4 py-1.5 text-white hover:opacity-90 transition">
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
`;
}

function hero(a: CLIAnswers): string {
  return `import Link from 'next/link';

export function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center pt-14">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-50 px-4 py-1.5 text-xs font-medium text-green-600">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        Now live — try it free
      </div>
      <h1 className="mt-6 text-5xl font-bold tracking-tight leading-tight max-w-3xl">
        Ship your SaaS in days,{' '}
        <span className="bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent">
          not months.
        </span>
      </h1>
      <p className="mt-6 text-xl text-gray-500 max-w-lg">
        ${a.projectName} gives you auth, database, and a dashboard — wired together and ready to deploy.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
        <Link href="/register" className="rounded-xl bg-brand px-8 py-3 font-medium text-white hover:opacity-90 transition">
          Get Started Free
        </Link>
        <Link href="#features" className="rounded-xl border px-8 py-3 font-medium hover:bg-gray-50 transition">
          See Features
        </Link>
      </div>
      <p className="mt-6 text-xs text-gray-400">
        No credit card required · MIT licensed · You own 100% of the code
      </p>
    </section>
  );
}
`;
}

function features(): string {
  return `import { Lock, Database, LayoutDashboard, FileText, Rocket, Shield } from 'lucide-react';

const features = [
  { icon: Lock,            title: 'Authentication',   desc: 'Email/password, Google OAuth, GitHub login. Session management and middleware included.'  },
  { icon: Database,        title: 'Database',          desc: 'Prisma ORM with full schema, migrations, and seed scripts. Production-ready from day one.' },
  { icon: LayoutDashboard, title: 'App Dashboard',     desc: 'Sidebar, settings, profile page, and stat cards. Real data from your database.'           },
  { icon: FileText,        title: 'Marketing Site',    desc: 'Hero, features, pricing, FAQ, and footer. Designed and ready to customise.'               },
  { icon: Rocket,          title: 'Deploy Config',     desc: 'vercel.json, .env.example, and a step-by-step README. Push and your SaaS is live.'        },
  { icon: Shield,          title: 'TypeScript Strict', desc: 'Strict mode throughout. Every route, form, and query is fully typed.'                     },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 border-t">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Everything wired. Nothing missing.</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Every module is built to production standards — not a starter you still have to configure.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border p-6 hover:border-brand/30 transition-colors">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                <f.icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function howItWorks(): string {
  return `const steps = [
  { number: '01', title: 'Run the CLI',        desc: 'One command launches the interactive setup. No downloads, no zip files.',       code: 'npx create-basebolt@latest'              },
  { number: '02', title: 'Answer a few things', desc: 'Choose your database and deployment target. Takes under 60 seconds.',          code: '✔ DB: Supabase\\n✔ Deploy: Vercel'        },
  { number: '03', title: 'Project scaffolded',  desc: 'A complete Next.js SaaS codebase appears in your folder. Typed and wired.',    code: '✅ Done in 90 seconds\\ncd my-app && npm run dev' },
  { number: '04', title: 'Ship it',             desc: 'Deploy to Vercel in one command. Fill in env vars. Your SaaS is live.',        code: 'npx vercel'                              },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 border-t bg-gray-50">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">From zero to deployed in 4 steps.</h2>
          <p className="mt-3 text-gray-500">No config hell. No decision fatigue. Under 10 minutes.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.number} className="rounded-xl border bg-white p-5">
              <div className="text-4xl font-black text-gray-100 mb-3">{s.number}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{s.desc}</p>
              <pre className="rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 whitespace-pre-wrap overflow-x-auto">{s.code}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function pricing(): string {
  return `import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name:    'Core',
    price:   '$0',
    period:  'Free forever',
    desc:    'Everything you need to start. Auth, database, dashboard, and deploy config.',
    cta:     'Get Started Free',
    href:    '/register',
    popular: false,
    features: ['NextAuth.js — email + Google + GitHub', 'Prisma + Supabase schema', 'App dashboard + settings', 'Marketing site + blog', 'Deploy config (Vercel)', 'MIT licensed'],
  },
  {
    name:    'Solo',
    price:   '$49',
    period:  'One-time · Yours forever',
    desc:    'Full scaffold. Billing, email, admin panel — everything to launch a real SaaS.',
    cta:     'Buy Solo — $49',
    href:    'https://basebolt.dev/pro',
    popular: true,
    features: ['Everything in Core', 'Stripe or LemonSqueezy billing', '5 transactional email templates', 'Admin panel + user management', 'Lifetime updates'],
  },
  {
    name:    'Agency',
    price:   '$99',
    period:  'Per month',
    desc:    'For teams building SaaS for clients. White-label, unlimited projects.',
    cta:     'Start Agency Plan',
    href:    'https://basebolt.dev/pro',
    popular: false,
    features: ['Everything in Solo', 'White-label — remove Basebolt branding', 'Unlimited client projects', 'Teams & RBAC', 'Client handoff workflow'],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 border-t">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Free Core. Advanced architecture separately.</h2>
          <p className="mt-3 text-gray-500">Core is permanently free under MIT. Pro unlocks the full scaffold.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={\`relative rounded-2xl border p-8 \${plan.popular ? 'border-brand shadow-lg shadow-brand/10' : ''}\`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{plan.name}</p>
              <div className="mb-1">
                <span className="text-4xl font-bold">{plan.price}</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">{plan.period}</p>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{plan.desc}</p>
              <ul className="mb-8 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={\`block w-full rounded-xl py-2.5 text-center text-sm font-medium transition \${plan.popular ? 'bg-brand text-white hover:opacity-90' : 'border hover:bg-gray-50'}\`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function faq(): string {
  return `'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Is Core really free forever?',                a: 'Yes. Core is MIT licensed — use it for any project, commercial or personal, no strings attached.'                                         },
  { q: 'What does the CLI actually do?',              a: 'It scaffolds a complete production-ready Next.js codebase on your machine in under 90 seconds. You own every file.'                        },
  { q: 'Do I own the code?',                          a: 'Yes. 100%. Once scaffolded, the code is yours. No lock-in, no runtime dependency on Basebolt.'                                             },
  { q: "What's in Pro that's not in Free?",           a: 'Pro adds Stripe/LemonSqueezy billing, 5 email templates, admin panel, teams & RBAC, and the Pro dashboard app.'                          },
  { q: 'Which databases are supported?',              a: 'Supabase (recommended), Neon, and PlanetScale. All use Prisma ORM so switching is straightforward.'                                        },
  { q: 'Do Solo users get lifetime updates?',         a: 'Yes. Solo is a one-time purchase and includes all future updates to the Solo scaffold — no subscription, no renewal.'                      },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 border-t bg-gray-50">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border bg-white overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">{faq.q}</span>
                <ChevronDown className={\`h-4 w-4 text-gray-400 transition-transform \${open === i ? 'rotate-180' : ''}\`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm mb-2">Still have questions?</p>
          <a href="mailto:hello@basebolt.dev" className="text-sm font-medium text-brand hover:underline">
            Contact Support →
          </a>
        </div>
      </div>
    </section>
  );
}
`;
}

function cta(): string {
  return `import Link from 'next/link';
import { Check } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 px-4 border-t">
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-50 to-transparent p-12">
          <h2 className="text-3xl font-bold mb-4">Your next SaaS is one command away.</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Start free. Ship faster. Own everything.<br />
            Core is permanently free under MIT — no credit card, no expiry.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/register" className="rounded-xl bg-brand px-8 py-3 font-medium text-white hover:opacity-90 transition">
              Get Started Free
            </Link>
            <Link href="/#pricing" className="rounded-xl border px-8 py-3 font-medium hover:bg-gray-50 transition">
              Compare plans
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {['No credit card required', 'MIT licensed', 'You own the code'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs text-gray-400">
                <Check className="h-3 w-3 text-green-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function footer(): string {
  return `import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="text-sm font-semibold mb-3">Product</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#features" className="hover:text-gray-900">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-gray-900">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-gray-900">Docs</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Company</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
              <li><a href="mailto:hello@basebolt.dev" className="hover:text-gray-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/legal/terms" className="hover:text-gray-900">Terms</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-gray-900">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Links</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="https://github.com/saifecho/create-basebolt" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">GitHub</a></li>
              <li><a href="https://www.npmjs.com/package/create-basebolt" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">npm</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-8">
          <p className="font-bold text-brand">Basebolt</p>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Basebolt. All rights reserved.</p>
          <p className="text-xs text-gray-400">Ship your SaaS in days, not months.</p>
        </div>
      </div>
    </footer>
  );
}
`;
}
