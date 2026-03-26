#!/usr/bin/env node
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { runCLI } from './cli.js';

async function main() {
  console.log('');

  // ── ASCII banner — white so it's visible on any terminal ──────────
  const banner = [
    '  ██████╗  █████╗ ███████╗███████╗██████╗  ██████╗ ██╗  ████████╗',
    '  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██╔═══██╗██║  ╚══██╔══╝',
    '  ██████╔╝███████║███████╗█████╗  ██████╔╝██║   ██║██║     ██║   ',
    '  ██╔══██╗██╔══██║╚════██║██╔══╝  ██╔══██╗██║   ██║██║     ██║   ',
    '  ██████╔╝██║  ██║███████║███████╗██████╔╝╚██████╔╝███████╗██║   ',
    '  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚═╝   ',
  ];

  console.log(chalk.white.bold(banner.join('\n')));
  console.log('');
  console.log(
    chalk.gray('  ') +
    chalk.hex('#D97706').bold('Ship your SaaS in days, not months.') +
    chalk.gray('  ·  v0.2.0')
  );
  console.log(
    chalk.gray('  Scaffold a production-ready Next.js SaaS in under 90 seconds.\n')
  );

  p.intro(chalk.bgHex('#D97706').black('  basebolt  '));

  try {
    await runCLI();
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ERR_USE_BEFORE_READY') {
      p.cancel(chalk.yellow('Cancelled.'));
      process.exit(0);
    }
    p.cancel(chalk.red('Something went wrong.'));
    console.error(err);
    process.exit(1);
  }
}

main();
