import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('production bundle', () => {
  it('is emitted as native ESM', async () => {
    const bundleUrl = new URL('../dist/main.js', import.meta.url);
    const bundle = await readFile(bundleUrl, {
      encoding: 'utf8',
    });

    await execFileAsync(process.execPath, [
      '--check',
      fileURLToPath(bundleUrl),
    ]);
    expect(bundle).toMatch(/^import\b/);
    expect(bundle).toMatch(/export\s*\{\s*viteNodeApp\s*\}/);
  });
});
