/**
 * Cross-platform asset copy script.
 *
 * Copies the resources/ directory to dist/resources/.
 * All bundled assets (docs, themes, permissions, tool-icons) now live in resources/
 * which electron-builder handles natively via directories.buildResources.
 *
 * At Electron startup, setBundledAssetsRoot(__dirname) is called, and then
 * getBundledAssetsDir('docs') resolves to <__dirname>/resources/docs/, etc.
 *
 * Run: bun scripts/copy-assets.ts
 */

import { cpSync, copyFileSync } from 'fs';
import { join } from 'path';

const ELECTRON_DIR = join(import.meta.dir, '..')
const REPO_ROOT = join(ELECTRON_DIR, '..', '..')

export function getAssetCopyPairs(repoRoot: string): Array<{ source: string; destination: string }> {
  return [
    {
      source: join(repoRoot, 'apps', 'electron', 'resources'),
      destination: join(repoRoot, 'apps', 'electron', 'dist', 'resources'),
    },
    {
      source: join(repoRoot, 'packages', 'shared', 'locales'),
      destination: join(repoRoot, 'apps', 'electron', 'dist', 'resources', 'locales'),
    },
  ]
}

export function copyAssets(repoRoot: string): void {
  for (const pair of getAssetCopyPairs(repoRoot)) {
    cpSync(pair.source, pair.destination, { recursive: true, force: true })
  }

  console.log('✓ Copied resources/ → dist/resources/')
  console.log('✓ Copied shared locales/ → dist/resources/locales/')

  // Copy PowerShell parser script (for Windows command validation in Explore mode)
  // Source: packages/shared/src/agent/powershell-parser.ps1
  // Destination: dist/resources/powershell-parser.ps1
  const psParserSrc = join(repoRoot, 'packages', 'shared', 'src', 'agent', 'powershell-parser.ps1')
  const psParserDest = join(repoRoot, 'apps', 'electron', 'dist', 'resources', 'powershell-parser.ps1')
  try {
    copyFileSync(psParserSrc, psParserDest)
    console.log('✓ Copied powershell-parser.ps1 → dist/resources/')
  } catch {
    // Only warn - PowerShell validation is optional on non-Windows platforms
    console.log('⚠ powershell-parser.ps1 copy skipped (not critical on non-Windows)')
  }
}

if (import.meta.main) {
  copyAssets(REPO_ROOT)
}
