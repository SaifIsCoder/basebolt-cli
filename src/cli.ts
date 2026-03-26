import * as p from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import { scaffold }     from './scaffold/index.js';
import { writeConfig }  from './utils/config.js';
import { showProUpsell } from './pro.js';

export type CLIAnswers = {
  projectName:    string;
  template:       'free' | 'pro';
  auth:           'nextauth' | 'supabase';
  database:       'supabase' | 'neon';
  payment:        'stripe' | 'lemonsqueezy' | 'none';
  email:          'resend' | 'nodemailer' | 'none';
  marketingSite:  boolean;
  blog:           boolean;
  waitlist:       boolean;
  magicLink:      boolean;
  darkMode:       boolean;
  deployment:     'vercel';
};

function cancel(val: unknown): boolean {
  if (p.isCancel(val)) { p.cancel(chalk.yellow('Cancelled.')); process.exit(0); }
  return false;
}

export async function runCLI(): Promise<void> {

  // ── Step 1: Project name ─────────────────────────────────────────
  const projectName = await p.text({
    message:      'Project name:',
    placeholder:  'my-saas',
    defaultValue: 'my-saas',
    validate(val) {
      if (!val || val.trim().length === 0) return 'Project name is required.';
      if (!/^[a-z0-9-_]+$/i.test(val))    return 'Use only letters, numbers, hyphens, or underscores.';
    },
  });
  cancel(projectName);

  // ── Step 2: Template ─────────────────────────────────────────────
  const template = await p.select({
    message: 'Choose your starting point:',
    options: [
      { value: 'free', label: 'Free  — core SaaS starter',        hint: 'MIT licensed, yours forever'      },
      { value: 'pro',  label: 'Pro   — advanced SaaS system 🔒',  hint: 'Teams, billing, RBAC, dashboard'  },
    ],
  });
  cancel(template);

  if (template === 'pro') {
    const continueWithFree = await showProUpsell();
    if (!continueWithFree) { p.outro(chalk.gray('See you at basebolt.dev/pro 👋')); process.exit(0); }
  }

  p.log.step(chalk.green('✔') + chalk.gray('  Using Free template'));
  console.log('');

  // ── Step 3: Auth provider ────────────────────────────────────────
  const authChoice = await p.select({
    message: 'Authentication provider:',
    options: [
      { value: 'supabase',  label: 'Supabase Auth',  hint: 'Email/password + Google OAuth (recommended)' },
      { value: 'nextauth',  label: 'NextAuth.js',    hint: 'Email/password + Google + GitHub OAuth'      },
    ],
  });
  cancel(authChoice);

  // ── Step 4: Database ─────────────────────────────────────────────
  const dbChoice = await p.select({
    message: 'Database:',
    options: [
      { value: 'supabase',  label: 'Supabase',   hint: 'PostgreSQL — generous free tier (recommended)' },
      { value: 'neon',      label: 'Neon',        hint: 'Serverless PostgreSQL, generous free tier'     },
    ],
  });
  cancel(dbChoice);

  // ── Step 5: Features ─────────────────────────────────────────────
  p.log.info(chalk.gray('↑↓ navigate   Space to toggle   Enter to confirm'));
  console.log('');

  const features = await p.multiselect({
    message: 'Select features to include:',
    options: [
      { value: 'marketingSite', label: 'Marketing Site',          hint: 'Hero, features, pricing, FAQ, footer'       },
      { value: 'blog',          label: 'Blog + SEO',              hint: 'MDX posts, sitemap, OG images, RSS'         },
      { value: 'waitlist',      label: 'Waitlist',                hint: 'Email collection form + Prisma model'       },
      { value: 'magicLink',     label: 'Magic Link Login',        hint: 'Passwordless email login'                   },
      { value: 'darkMode',      label: 'Dark Mode Toggle',        hint: 'Theme switcher with next-themes'            },
      { value: '__pro_billing', label: 'Billing        🔒 Pro',   hint: 'Stripe or LemonSqueezy · basebolt.dev/pro'  },
      { value: '__pro_team',    label: 'Teams & RBAC   🔒 Pro',   hint: 'Org management · basebolt.dev/pro'          },
      { value: '__pro_admin',   label: 'Admin Panel    🔒 Pro',   hint: 'User management · basebolt.dev/pro'         },
    ],
    initialValues: ['marketingSite', 'darkMode'],
    required: false,
  });
  cancel(features);

  const featArr = features as string[];

  // ── Pro nudge if any Pro items selected ──────────────────────────
  const selectedPro = featArr.filter(f => f.startsWith('__pro_'));
  if (selectedPro.length > 0) {
    console.log('');
    p.log.warn(
      chalk.hex('#D97706')('🔒 Pro features selected — these will not be scaffolded.\n') +
      chalk.gray('   Get full access: ') + chalk.cyan('basebolt.dev/pro')
    );
    console.log('');
  }

  // ── Build answers ────────────────────────────────────────────────
  const answers: CLIAnswers = {
    projectName:   projectName as string,
    template:      'free',
    auth:          authChoice as CLIAnswers['auth'],
    database:      dbChoice as CLIAnswers['database'],
    payment:       'none',
    email:         'none',
    marketingSite: featArr.includes('marketingSite'),
    blog:          featArr.includes('blog'),
    waitlist:      featArr.includes('waitlist'),
    magicLink:     featArr.includes('magicLink'),
    darkMode:      featArr.includes('darkMode'),
    deployment:    'vercel',
  };

  // ── Generate ─────────────────────────────────────────────────────
  console.log('');
  const spinner = p.spinner();
  spinner.start('Fetching latest package versions...');

  const projectDir = path.resolve(process.cwd(), answers.projectName);

  spinner.message('Creating folder structure...');
  await scaffold(projectDir, answers);

  spinner.message('Writing config...');
  await writeConfig(projectDir, answers);

  spinner.stop(chalk.green('✔') + '  Project generated successfully.');

  // ── Next steps ───────────────────────────────────────────────────
  console.log('');
  p.note(
    [
      chalk.white(`cd ${answers.projectName}`),
      chalk.white('npm install'),
      chalk.white('cp .env.example .env.local'),
      chalk.gray('# Fill in your Supabase + auth keys'),
      chalk.white('npm run dev'),
    ].join('\n'),
    '🎉 Your SaaS is ready'
  );

  // ── Pro nudge ────────────────────────────────────────────────────
  console.log('');
  console.log(chalk.gray('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.white('  🚀 Ready to ship faster?'));
  console.log(chalk.gray('  Basebolt Pro adds:'));
  console.log(chalk.gray('    + Stripe or LemonSqueezy billing'));
  console.log(chalk.gray('    + 5 transactional email templates'));
  console.log(chalk.gray('    + Teams, RBAC, org management'));
  console.log(chalk.gray('    + Admin panel + Pro dashboard'));
  console.log('');
  console.log(chalk.cyan('  👉 basebolt.dev/pro'));
  console.log(chalk.gray('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  p.outro(chalk.green('Happy shipping! ⚡'));
}
