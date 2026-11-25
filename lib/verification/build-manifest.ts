import { mkdir, writeFile } from 'node:fs/promises';
import { buildVerificationManifest } from './target.ts';
async function main() {
  await mkdir('.verification', { recursive: true });
  await writeFile('.verification/build-manifest.json', JSON.stringify(buildVerificationManifest(process.env)) + '\n', { mode: 0o600 });
}
main().catch(() => { console.error('Verification build configuration unavailable'); process.exitCode = 1; });
