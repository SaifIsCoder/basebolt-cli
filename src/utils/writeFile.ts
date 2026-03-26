import fs from 'fs-extra';
import path from 'path';

export async function writeFile(base: string, rel: string, content: string) {
  const full = path.join(base, rel);
  await fs.ensureDir(path.dirname(full));
  await fs.writeFile(full, content, 'utf8');
}
