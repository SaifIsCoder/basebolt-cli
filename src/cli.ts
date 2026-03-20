import * as p from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import { scaffold, writeConfig } from './scaffold.js';
import { showProUpsell } from './pro.js';

export type CLIAnswers = {
  projectName: string;
  template: 'free' | 'pro';
  auth: 'nextauth' | 'clerk' | null;
  database: 'postgresql' | 'supabase' | null;
  dashboard: boolean;
  stripe: boolean;
  email: boolean;
  adminPanel: boolean;
  marketingSite: boolean;
  deployment: 'vercel' | 'railway';
};

function isCancel(val: unknown): boolean {
  return p.isCancel(val);
}

export async function runCLI(): Promise<void> {
  const projectName = await p.text({
    message: 'Project name:',
    placeholder: 'my-saas',
    defaultValue: 'my-saas',
    validate(val) {
      if (!val || val.trim().length === 0) return 'Project name is required.';
      if (!/^[a-z0-9-_]+$/i.test(val)) return 'Use only letters, numbers, hyphens, or underscores.';
    },
  });

  if (isCancel(projectName)) {
    p.cancel(chalk.yellow('Cancelled.'));
    process.exit(0);
  }

  const template = await p.select({
    message: 'Choose your starting point:',
    options: [
      {
        value: 'free',
        label: 'Free  - core SaaS starter',
        hint: 'MIT licensed, yours forever',
      },
      {
        value: 'pro',
        label: 'Pro   - advanced SaaS system',
        hint: 'Teams, Stripe billing, RBAC',
      },
    ],
  });

  if (isCancel(template)) {
    p.cancel(chalk.yellow('Cancelled.'));
    process.exit(0);
  }

  if (template === 'pro') {
    const continueWithFree = await showProUpsell();
    if (!continueWithFree) {
      p.outro(chalk.gray('See you at basebolt.vercel.app/pro'));
      process.exit(0);
    }
  }

  p.log.step(`${chalk.green('OK')} ${chalk.gray('Using Free template')}`);
  console.log('');

  p.log.info(chalk.gray('Use Space to toggle and Enter to confirm.'));
  console.log('');

  const features = await p.multiselect({
    message: 'Select features to include:',
    options: [
      { value: 'auth', label: 'Authentication', hint: 'Email/password + social login' },
      { value: 'database', label: 'Database', hint: 'Prisma + PostgreSQL' },
      { value: 'dashboard', label: 'App Dashboard', hint: 'Sidebar, settings, profile' },
      { value: 'marketingSite', label: 'Marketing Site', hint: 'Hero, features, pricing, footer' },
    ],
    initialValues: ['auth', 'database', 'dashboard'],
    required: true,
  });

  if (isCancel(features)) {
    p.cancel(chalk.yellow('Cancelled.'));
    process.exit(0);
  }

  const featArr = features as string[];
  const hasAuth = featArr.includes('auth');
  const requestedDatabase = featArr.includes('database');
  const hasDatabase = requestedDatabase || hasAuth;
  const hasDashboard = featArr.includes('dashboard');

  console.log('');
  p.note(
    [
      'Stripe Billing',
      'Email System',
      'Admin Panel',
      'Teams & RBAC',
      '',
      'Available in Basebolt Pro: basebolt.vercel.app/pro',
    ].join('\n'),
    'Pro Features'
  );

  if (hasAuth && !requestedDatabase) {
    console.log('');
    p.log.info(chalk.gray('Database was enabled automatically because authentication needs it.'));
  }

  let auth: CLIAnswers['auth'] = null;
  if (hasAuth) {
    const authChoice = await p.select({
      message: 'Auth provider:',
      options: [
        { value: 'nextauth', label: 'NextAuth.js', hint: 'Open source, database-backed auth' },
        { value: 'clerk', label: 'Clerk', hint: 'Hosted auth, faster setup' },
      ],
    });

    if (isCancel(authChoice)) {
      p.cancel(chalk.yellow('Cancelled.'));
      process.exit(0);
    }

    auth = authChoice as CLIAnswers['auth'];
  }

  let database: CLIAnswers['database'] = null;
  if (hasDatabase) {
    const dbChoice = await p.select({
      message: 'Database provider:',
      options: [
        { value: 'postgresql', label: 'PostgreSQL', hint: 'Neon or local Postgres' },
        { value: 'supabase', label: 'Supabase', hint: 'Managed PostgreSQL' },
      ],
    });

    if (isCancel(dbChoice)) {
      p.cancel(chalk.yellow('Cancelled.'));
      process.exit(0);
    }

    database = dbChoice as CLIAnswers['database'];
  }

  const deployment = await p.select({
    message: 'Deployment target:',
    options: [
      { value: 'vercel', label: 'Vercel', hint: 'Recommended for Next.js' },
      { value: 'railway', label: 'Railway', hint: 'Simple full-stack hosting' },
    ],
  });

  if (isCancel(deployment)) {
    p.cancel(chalk.yellow('Cancelled.'));
    process.exit(0);
  }

  const answers: CLIAnswers = {
    projectName: projectName as string,
    template: 'free',
    auth,
    database,
    dashboard: hasDashboard,
    stripe: false,
    email: false,
    adminPanel: false,
    marketingSite: featArr.includes('marketingSite'),
    deployment: deployment as CLIAnswers['deployment'],
  };

  console.log('');
  const spinner = p.spinner();
  spinner.start('Generating your project...');

  const projectDir = path.resolve(process.cwd(), answers.projectName);

  await sleep(300);
  spinner.message('Creating folder structure...');
  await scaffold(projectDir, answers);

  await sleep(300);
  spinner.message('Writing config file...');
  await writeConfig(projectDir, answers);

  await sleep(200);
  spinner.stop(`${chalk.green('OK')} Project generated successfully.`);

  console.log('');
  p.note(
    [
      chalk.white(`cd ${answers.projectName}`),
      chalk.white('npm install'),
      chalk.white('cp .env.example .env.local'),
      chalk.white('npm run dev'),
    ].join('\n'),
    'Your SaaS starter is ready'
  );

  console.log('');
  console.log(chalk.gray('  ---------------------------------------'));
  console.log(chalk.bold.white('  Want more?'));
  console.log(chalk.gray('  Basebolt Pro includes:'));
  console.log(chalk.gray('    + Teams and organizations'));
  console.log(chalk.gray('    + Stripe billing system'));
  console.log(chalk.gray('    + Advanced permissions'));
  console.log(chalk.gray('    + Scalable SaaS architecture'));
  console.log('');
  console.log(chalk.cyan('  basebolt.vercel.app/pro'));
  console.log(chalk.gray('  ---------------------------------------'));
  console.log('');

  p.outro(chalk.green('Happy shipping!'));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
