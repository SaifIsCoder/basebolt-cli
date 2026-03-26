import type { CLIAnswers } from '../cli.js';
import { writeFile } from '../utils/writeFile.js';

export async function scaffoldDeploy(projectDir: string, _a: CLIAnswers): Promise<void> {
  await writeFile(projectDir, 'vercel.json', vercelJson());
}

function vercelJson(): string {
  return JSON.stringify({
    framework: 'nextjs',
    buildCommand: 'npm run build',
    devCommand: 'npm run dev',
    installCommand: 'npm install',
  }, null, 2);
}
