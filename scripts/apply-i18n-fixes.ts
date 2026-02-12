#!/usr/bin/env bun
/**
 * I18n Auto-Fix Script
 *
 * Automatically fixes common i18n integration issues after merge.
 * This is called by upstream-sync.yml after merging i18n changes.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const ELECTRON = join(ROOT, 'apps/electron')
const ELECTRON_RENDERER = join(ELECTRON, 'src/renderer')

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(level: 'info' | 'warn' | 'error' | 'success', message: string) {
  const color = level === 'error' ? colors.red :
                level === 'warn' ? colors.yellow :
                level === 'success' ? colors.green :
                colors.blue
  console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`)
}

function info(message: string) {
  log('info', message)
}

function warn(message: string) {
  log('warn', message)
}

function success(message: string) {
  log('success', message)
}

// Fix 1: Add missing imports to ipc.ts
function fixIpcImports(): boolean {
  const ipcFile = join(ELECTRON, 'src/main/ipc.ts')
  if (!existsSync(ipcFile)) {
    warn(`ipc.ts not found, skipping import fixes`)
    return false
  }

  let content = readFileSync(ipcFile, 'utf-8')
  let modified = false

  const importMap: Record<string, string> = {
    'getDefaultModelsForConnection': 'getDefaultModelsForConnection',
    'getDefaultModelForConnection': 'getDefaultModelForConnection',
    'isAnthropicProvider': 'isAnthropicProvider',
    'isOpenAIProvider': 'isOpenAIProvider',
    'isCompatProvider': 'isCompatProvider',
    'isCopilotProvider': 'isCopilotProvider',
    'setDefaultLlmConnection': 'setDefaultLlmConnection',
    'addLlmConnection': 'addLlmConnection',
    'updateLlmConnection': 'updateLlmConnection',
  }

  const sharedConfigImport = content.match(/import\s+\{[^}]*\}\s+from\s+['"]@craft-agent\/shared\/config['"]/)
  if (!sharedConfigImport) {
    warn(`No import from @craft-agent/shared/config found, cannot add imports`)
    return false
  }

  const importMatch = sharedConfigImport[0]
  let imports: string[] = []
  const importContentMatch = importMatch.match(/\{([^}]*)\}/)
  if (importContentMatch) {
    imports = importContentMatch[1].split(',').map(s => s.trim()).filter(s => s)
  }

  for (const [func, importName] of Object.entries(importMap)) {
    if (content.includes(func) && !imports.includes(importName)) {
      info(`Adding missing import: ${importName}`)
      imports.push(importName)
      modified = true
    }
  }

  if (modified) {
    const newImport = `import { ${imports.join(', ')} } from '@craft-agent/shared/config'`
    content = content.replace(importMatch, newImport)
    writeFileSync(ipcFile, content, 'utf-8')
    success(`Fixed imports in ipc.ts`)
  }

  return modified
}

// Fix 2: Add missing TooltipProvider import to AppShell.tsx
function fixTooltipProviderImport(): boolean {
  const appShellFile = join(ELECTRON_RENDERER, 'components/app-shell/AppShell.tsx')
  if (!existsSync(appShellFile)) {
    warn(`AppShell.tsx not found, skipping TooltipProvider fix`)
    return false
  }

  let content = readFileSync(appShellFile, 'utf-8')

  if (!content.includes('TooltipProvider')) {
    return false
  }

  if (content.includes('import.*TooltipProvider')) {
    return false
  }

  info(`Adding TooltipProvider import to AppShell.tsx`)
  if (content.includes('import {') && content.includes('from \'@radix-ui/react-tooltip\'')) {
    content = content.replace(
      /import \{([^}]*)\} from '@radix-ui\/react-tooltip'/,
      'import { $1, TooltipProvider } from \'@radix-ui/react-tooltip\''
    )
  } else if (content.includes('from \'@radix-ui/react-tooltip\'')) {
    content = content.replace(
      /import [^{]*from '@radix-ui\/react-tooltip'/,
      'import { TooltipProvider } from \'@radix-ui/react-tooltip\''
    )
  } else {
    const importEnd = content.lastIndexOf('import ')
    const importEndLineEnd = content.indexOf('\n', importEnd)
    content = content.slice(0, importEndLineEnd + 1) +
              `import { TooltipProvider } from '@radix-ui/react-tooltip'\n` +
              content.slice(importEndLineEnd + 1)
  }

  writeFileSync(appShellFile, content, 'utf-8')
  success(`Fixed TooltipProvider import in AppShell.tsx`)
  return true
}

// Fix 3: Add missing useAtomValue import to MainContentPanel.tsx
function fixUseAtomValueImport(): boolean {
  const mainContentPanelFile = join(ELECTRON_RENDERER, 'components/app-shell/MainContentPanel.tsx')
  if (!existsSync(mainContentPanelFile)) {
    warn(`MainContentPanel.tsx not found, skipping useAtomValue fix`)
    return false
  }

  let content = readFileSync(mainContentPanelFile, 'utf-8')

  if (!content.includes('useAtomValue')) {
    return false
  }

  if (content.includes('import.*useAtomValue')) {
    return false
  }

  info(`Adding useAtomValue import to MainContentPanel.tsx`)
  if (content.includes('import {') && content.includes('from \'jotai\'')) {
    content = content.replace(
      /import \{([^}]*)\} from 'jotai'/,
      'import { $1, useAtomValue } from \'jotai\''
    )
  } else if (content.includes('from \'jotai\'')) {
    content = content.replace(
      /import [^{]*from 'jotai'/,
      'import { useAtomValue } from \'jotai\''
    )
  } else {
    const importEnd = content.lastIndexOf('import ')
    const importEndLineEnd = content.indexOf('\n', importEnd)
    content = content.slice(0, importEndLineEnd + 1) +
              `import { useAtomValue } from 'jotai'\n` +
              content.slice(importEndLineEnd + 1)
  }

  writeFileSync(mainContentPanelFile, content, 'utf-8')
  success(`Fixed useAtomValue import in MainContentPanel.tsx`)
  return true
}

// Main function
function runFixes() {
  info('='.repeat(60))
  info('I18N Auto-Fix Script')
  info('='.repeat(60))

  let fixesApplied = 0

  if (fixIpcImports()) {
    fixesApplied++
  }

  if (fixTooltipProviderImport()) {
    fixesApplied++
  }

  if (fixUseAtomValueImport()) {
    fixesApplied++
  }

  info('='.repeat(60))
  if (fixesApplied > 0) {
    success(`✅ Applied ${fixesApplied} fix(es)`)
  } else {
    info('ℹ️  No fixes needed')
  }
  info('='.repeat(60))
}

// Run fixes
runFixes()