import * as p from '@clack/prompts';
import chalk from 'chalk';

export async function showProUpsell(): Promise<boolean> {
  console.log('');
  console.log(chalk.gray('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.white('  🔒 Basebolt Pro'));
  console.log(chalk.gray('  You\'re trying to access advanced features:\n'));
  console.log(chalk.green('    ✔ ') + chalk.white('Multi-tenant teams & organizations'));
  console.log(chalk.green('    ✔ ') + chalk.white('Stripe subscription billing'));
  console.log(chalk.green('    ✔ ') + chalk.white('Role-based access control (RBAC)'));
  console.log(chalk.green('    ✔ ') + chalk.white('Production-grade architecture'));
  console.log('');
  console.log(chalk.cyan('  👉 Get access: basebolt.dev/pro'));
  console.log(chalk.gray('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  const choice = await p.select({
    message: 'Continue with Free template instead?',
    options: [
      { value: 'continue', label: 'Yes, continue with Free' },
      { value: 'exit',     label: 'No, I\'ll check out Pro first' },
    ],
  });

  if (p.isCancel(choice) || choice === 'exit') {
    return false;
  }

  return true;
}
