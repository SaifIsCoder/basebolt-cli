import fs from 'fs-extra';
import type { CLIAnswers } from '../cli.js';

import { scaffoldCore }      from './core.js';
import { scaffoldAuth }      from './auth.js';
import { scaffoldDatabase }  from './database.js';
import { scaffoldDashboard } from './dashboard.js';
import { scaffoldMarketing } from './marketing.js';
import { scaffoldUI }        from './ui.js';
import { scaffoldBlog }      from './blog.js';
import { scaffoldDeploy }    from './deploy.js';
import { scaffoldWaitlist }  from './waitlist.js';

export async function scaffold(projectDir: string, answers: CLIAnswers): Promise<void> {
  await fs.ensureDir(projectDir);

  // ── Always included ───────────────────────────────────────────────
  await scaffoldCore(projectDir, answers);      // package.json, tsconfig, next.config, env
  await scaffoldAuth(projectDir, answers);      // Auth (NextAuth or Supabase), login, register, middleware
  await scaffoldDatabase(projectDir, answers);  // Prisma schema, seed, register API
  await scaffoldDashboard(projectDir, answers); // Dashboard pages, sidebar, settings
  await scaffoldUI(projectDir, answers);        // Button, input, card, ThemeToggle
  await scaffoldDeploy(projectDir, answers);    // Vercel config

  // ── Optional Free modules ─────────────────────────────────────────
  if (answers.marketingSite) await scaffoldMarketing(projectDir, answers);
  if (answers.blog)          await scaffoldBlog(projectDir, answers);
  if (answers.waitlist)      await scaffoldWaitlist(projectDir, answers);
}
