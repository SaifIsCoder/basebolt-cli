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
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-extrabold text-xl tracking-tighter flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-lg shadow-brand/20">
            <span className="text-white text-xs font-black">B</span>
          </div>
          <span>Basebolt</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition">
            Sign in
          </Link>
          <Link href="/register" className="glass-button rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-white">
            Get Started
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
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center pt-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/20 via-background to-background"></div>
      
      {/* Animated glowing orbs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 animate-pulse-slow rounded-full bg-brand/30 blur-[128px]"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 animate-pulse-slow rounded-full bg-accent/20 blur-[128px]" style={{ animationDelay: '2s' }}></div>

      <div className="animate-fade-up">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-medium text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Basebolt 2.0 is now live</span>
        </div>
      </div>
      
      <h1 className="animate-fade-up mt-2 text-5xl font-extrabold tracking-tight leading-tight sm:text-7xl max-w-4xl" style={{ animationDelay: '0.1s' }}>
        Ship your SaaS in days,{' '}
        <br className="hidden sm:block" />
        <span className="gradient-brand">
          not months.
        </span>
      </h1>
      
      <p className="animate-fade-up mt-8 text-lg sm:text-xl text-muted-foreground/80 text-gray-400 max-w-2xl" style={{ animationDelay: '0.2s' }}>
        ${a.projectName} gives you authentication, a secure database, and a beautiful dashboard — wired together and ready to scale.
      </p>
      
      <div className="animate-fade-up mt-12 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto" style={{ animationDelay: '0.3s' }}>
        <Link href="/register" className="glass-button group flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-semibold text-white">
          <span>Start Building Free</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="#features" className="glass-button flex w-full sm:w-auto items-center justify-center rounded-2xl px-8 py-4 font-semibold text-foreground">
          Explore Features
        </Link>
      </div>
      
      <p className="animate-fade-up mt-8 text-xs font-medium text-gray-500 uppercase tracking-widest" style={{ animationDelay: '0.4s' }}>
        TRUSTED BY Modern Developers · MIT LICENSED
      </p>
    </section>
  );
}
`;
}

function features(): string {
  return `import { Lock, Database, LayoutDashboard, FileText, Rocket, Shield } from 'lucide-react';

const features = [
  { icon: Lock,            title: 'Authentication',   desc: 'Secure sessions and middleware included out of the box.'  },
  { icon: Database,        title: 'Database Engine',  desc: 'Prisma ORM with fully typed schema and migrations.' },
  { icon: LayoutDashboard, title: 'App Dashboard',     desc: 'Beautiful stat cards, settings, and profile management.'           },
  { icon: FileText,        title: 'Marketing Site',    desc: 'High-converting components ready for your brand.'               },
  { icon: Rocket,          title: 'Deploy Ready',      desc: 'Configured for global edge deployments on zero notice.'        },
  { icon: Shield,          title: 'Type Safe',         desc: 'End-to-end strict TypeScript for absolute confidence.'                     },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-20 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Everything wired. <span className="text-gray-500 font-normal">Nothing missing.</span></h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A production-ready foundation designed to feel like magic. Every module is meticulously crafted to save you hundreds of hours.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="glass-card group relative p-8 rounded-3xl transition-transform duration-500 hover:-translate-y-2 animate-fade-up" style={{ animationDelay: \`\${i * 0.1}s\` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl"></div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/20">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
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
  { number: '01', title: 'Initialize Project', desc: 'One command launches the interactive setup. No downloads, no zip files.',       code: 'npx create-basebolt@latest'              },
  { number: '02', title: 'Answer Prompts', desc: 'Choose your database and deployment target. Takes under 60 seconds.',          code: '✔ DB: Supabase\\n✔ Deploy: Vercel'        },
  { number: '03', title: 'Scaffold Complete',  desc: 'A complete Next.js SaaS codebase appears in your folder. Typed and wired.',    code: '✅ Done in 90 seconds\\ncd my-app && npm run dev' },
  { number: '04', title: 'Deploy to Edge',             desc: 'Deploy to Vercel in one command. Fill in env vars. Your SaaS is live.',        code: 'npx vercel'                              },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 px-4 overflow-hidden bg-black/5 dark:bg-white/5">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-20 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">From zero to deployed in <span className="gradient-brand">4 steps.</span></h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">No config hell. No decision fatigue. Build your SaaS infrastructure in under 10 minutes.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-brand/30 to-transparent"></div>
          
          {steps.map((s, i) => (
            <div key={s.number} className="relative z-10 glass-card p-6 rounded-3xl animate-fade-up" style={{ animationDelay: \`\${i * 0.15}s\` }}>
              <div className="mx-auto flex h-16 w-16 mb-6 items-center justify-center rounded-2xl bg-background border border-border shadow-lg shadow-brand/10">
                <span className="text-2xl font-black gradient-brand">{s.number}</span>
              </div>
              <h3 className="font-bold text-lg mb-3 text-center">{s.title}</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed text-center">{s.desc}</p>
              <div className="rounded-xl bg-black/40 dark:bg-black/60 p-4 ring-1 ring-white/10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <pre className="font-mono text-xs text-brand truncate relative z-10">{s.code}</pre>
              </div>
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
    name:    'Core Starter',
    price:   '$0',
    period:  'Free forever',
    desc:    'Everything you need to start. Auth, database, dashboard, and deploy config.',
    cta:     'Get Started Free',
    href:    '/register',
    popular: false,
    features: ['NextAuth.js — email + OAuth', 'Prisma + Supabase schema', 'App dashboard + settings', 'Marketing site + blog', 'Deploy config (Vercel)', 'MIT licensed'],
  },
  {
    name:    'Basebolt Pro',
    price:   '$49',
    period:  'One-time · Yours forever',
    desc:    'Full scaffold. Billing, email, admin panel — everything to launch a real SaaS.',
    cta:     'Buy Pro — $49',
    href:    'https://basebolt.dev/pro',
    popular: true,
    features: ['Everything in Core', 'Stripe or LemonSqueezy', '5 premium email templates', 'Admin panel + user management', 'Lifetime software updates'],
  },
  {
    name:    'Agency License',
    price:   '$99',
    period:  'Per month',
    desc:    'For teams building SaaS for clients. White-label, unlimited projects.',
    cta:     'Start Agency Plan',
    href:    'https://basebolt.dev/pro',
    popular: false,
    features: ['Everything in Pro', 'White-label application', 'Unlimited client projects', 'Teams & RBAC architecture', 'Client handoff workflow'],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-4 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-20 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Simple, transparent pricing.</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Core is permanently free under MIT. Pro unlocks the full scaffold for production.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-center lg:px-8">
          {plans.map((plan, i) => (
            <div key={plan.name} className={\`relative glass-card rounded-[2rem] p-8 transition-all duration-500 animate-fade-up \${plan.popular ? 'border-brand/40 shadow-[0_0_40px_rgba(99,102,241,0.15)] md:-translate-y-4' : 'hover:scale-105'}\`} style={{ animationDelay: \`\${i * 0.15}s\` }}>
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand/20">
                    Most Popular
                  </span>
                </div>
              )}
              
              <p className="text-sm font-bold uppercase tracking-widest text-brand mb-4">{plan.name}</p>
              
              <div className="mb-2 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
              </div>
              
              <p className="text-sm text-gray-400 font-medium mb-6">{plan.period}</p>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed h-12">{plan.desc}</p>
              
              <ul className="mb-10 space-y-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href={plan.href}
                className={\`block w-full rounded-2xl py-4 text-center text-sm font-bold transition-all duration-300 \${plan.popular ? 'bg-brand text-white hover:bg-brand-light hover:shadow-lg hover:shadow-brand/25' : 'bg-white/10 text-white hover:bg-white/20'}\`}
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
    <section id="faq" className="py-32 px-4 relative overflow-hidden bg-black/5 dark:bg-white/5">
      <div className="mx-auto max-w-3xl relative z-10">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Frequently Asked Questions</h2>
          <p className="text-gray-400">Everything you need to know about the product and billing.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand/30 animate-fade-up" style={{ animationDelay: \`\${i * 0.1}s\` }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-lg">{faq.q}</span>
                <span className={\`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 transition-transform duration-300 \${open === i ? 'rotate-180 bg-brand/20 text-brand' : ''}\`}>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              <div className={\`grid transition-all duration-300 ease-in-out \${open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}\`}>
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-gray-400 leading-relaxed pt-2 border-t border-white/5 mx-6">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-gray-400 text-sm mb-3">Still have questions?</p>
          <a href="mailto:hello@basebolt.dev" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-light transition duration-300">
            Contact Support <ChevronDown className="h-4 w-4 -rotate-90" />
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
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-brand/20 via-background to-background"></div>
      
      <div className="mx-auto max-w-4xl text-center relative z-10">
        <div className="glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-brand/10 border-brand/20">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand/30 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Your next SaaS is <br className="hidden sm:block" /><span className="gradient-brand">one command away.</span></h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Stop wiring up authentication and databases. Start building your actual product. Core is permanently free.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register" className="glass-button group flex items-center justify-center gap-2 rounded-2xl bg-brand/90 hover:bg-brand px-8 py-4 font-bold text-white">
              <span>Get Started Flow</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/#pricing" className="glass-button rounded-2xl px-8 py-4 font-bold text-foreground hover:bg-white/10">
              View Premium
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {['No credit card required', 'MIT licensed forever', 'Absolute code ownership'].map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-brand" />
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
    <footer className="border-t border-white/10 bg-black/5 dark:bg-black/20 pt-16 pb-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
             <Link href="/" className="font-extrabold text-xl tracking-tighter flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-lg shadow-brand/20">
                <span className="text-white text-xs font-black">B</span>
              </div>
              <span>Basebolt</span>
            </Link>
            <p className="text-gray-400 max-w-xs mb-6 text-sm leading-relaxed">
              The premium, production-ready foundation designed to help you ship SaaS applications in record time.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-4">Product</p>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#features" className="hover:text-brand transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-brand transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-brand transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-4">Company</p>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-brand transition-colors">About Us</Link></li>
              <li><a href="mailto:hello@basebolt.dev" className="hover:text-brand transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-4">Legal</p>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/legal/terms" className="hover:text-brand transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-brand transition-colors">Privacy Policy</Link></li>
              <li><a href="https://github.com/saifecho/create-basebolt" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">GitHub Repository</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="text-sm text-gray-500 font-medium">© {new Date().getFullYear()} Basebolt Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
             <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
             <p className="text-xs text-gray-500 uppercase tracking-widest">All systems operational</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
`;
}
