import fs from 'fs-extra';
import path from 'path';
import type { CLIAnswers } from '../cli.js';

export async function writeConfig(projectDir: string, a: CLIAnswers): Promise<void> {
  const now = new Date().toISOString().split('T')[0];

  const dbLabel = { supabase: 'Supabase', neon: 'Neon' }[a.database];
  const authLabel = a.auth === 'supabase' ? 'Supabase Auth' : 'NextAuth.js';

  const features = [
    `- **Marketing Site:** ${a.marketingSite ? 'Yes' : 'No'}`,
    `- **Blog + SEO:** ${a.blog ? 'Yes' : 'No'}`,
    `- **Waitlist:** ${a.waitlist ? 'Yes' : 'No'}`,
    `- **Magic Link Login:** ${a.magicLink ? 'Yes' : 'No'}`,
    `- **Dark Mode:** ${a.darkMode ? 'Yes' : 'No'}`,
  ].join('\n');

  const content = `# Basebolt Configuration
Generated: ${now}

## Project
- **Name:** ${a.projectName}
- **Template:** Free (Core)
- **Framework:** Next.js 14 (App Router)

## Stack
- **Auth:** ${authLabel}
- **Database:** Prisma + ${dbLabel}
- **Deployment:** Vercel

## Features
${features}

## Next Steps
1. \`cd ${a.projectName}\`
2. \`npm install\`
3. \`cp .env.example .env.local\`  — fill in your keys
4. \`npm run db:push\`             — push schema to database
5. \`npm run db:seed\`             — seed with test users
6. \`npm run dev\`
${a.auth === 'nextauth' ? `
## Test Accounts (after seeding)
- Admin: admin@example.com / admin123!
- User:  user@example.com  / user123!
` : ''}
## Pro Features
Unlock Stripe/LemonSqueezy billing, email templates, teams, RBAC,
admin panel, and the Pro dashboard at basebolt.dev/pro

---
Scaffolded by [Basebolt CLI](https://basebolt.dev)
`;

  await fs.writeFile(path.join(projectDir, 'basebolt.config.md'), content, 'utf8');
}
