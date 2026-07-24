#!/usr/bin/env node
/**
 * Fails the build if any committed .env.production* file enables mock mode
 * or the dev-only auth bypass. Defense in depth alongside the throw in
 * next.config.ts — see mock/README.md.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DANGEROUS_FLAGS = ['NEXT_PUBLIC_USE_MOCKS', 'NEXT_PUBLIC_AUTH_BYPASS'];

const envFiles = readdirSync(ROOT).filter(
  (f) => f.startsWith('.env.production')
);

let failed = false;

for (const file of envFiles) {
  const contents = readFileSync(join(ROOT, file), 'utf8');
  for (const flag of DANGEROUS_FLAGS) {
    const match = contents.match(new RegExp(`^${flag}\\s*=\\s*true\\s*$`, 'm'));
    if (match) {
      console.error(`✗ ${file} sets ${flag}=true — forbidden in a production environment file.`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`✓ No production env file enables mock mode or the auth bypass (checked: ${envFiles.join(', ') || 'none found'}).`);
