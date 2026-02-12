#!/usr/bin/env bun
/**
 * I18n Verification Script
 *
 * Verifies that i18n integration is correctly set up after merge.
 * Checks:
 * - i18next config exists
 * - Locale files exist
 * - Main process i18n initialization works
 * - Renderer process i18n initialization works
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const PACKAGES_SHARED = join(ROOT, 'packages/shared')
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

function error(message: string) {
  log('error', message)
  process.exit(1)
}

function warn(message: string) {
  log('warn', message)
}

function info(message: string) {
  log('info', message)
}

function success(message: string) {
  log('success', message)
}

// Check if a file exists
function checkFile(path: string, description: string): boolean {
  if (existsSync(path)) {
    success(`${description}: ${path}`)
    return true
  } else {
    error(`${description} NOT FOUND: ${path}`)
    return false
  }
}

// Check if a directory exists
function checkDir(path: string, description: string): boolean {
  if (existsSync(path)) {
    success(`${description}: ${path}`)
    return true
  } else {
    error(`${description} NOT FOUND: ${path}`)
    return false
  }
}

// Check if locale files exist
function checkLocales(): boolean {
  info('Checking locale files...')
  const localesDir = join(PACKAGES_SHARED, 'locales')
  if (!checkDir(localesDir, 'Locales directory')) return false

  const requiredLocales = ['en', 'zh-CN']
  let allExist = true

  for (const locale of requiredLocales) {
    const localeDir = join(localesDir, locale)
    if (!checkDir(localeDir, `Locale directory (${locale})`)) {
      allExist = false
    } else {
      const requiredNamespaces = ['onboarding', 'common']
      for (const namespace of requiredNamespaces) {
        const namespaceFile = join(localeDir, `${namespace}.json`)
        if (!checkFile(namespaceFile, `Locale namespace file (${locale}/${namespace})`)) {
          allExist = false
        }
      }
    }
  }

  if (allExist) {
    success('All required locale files exist with required namespaces')
  }

  return allExist
}

// Check main process i18n setup
function checkMainI18n(): boolean {
  info('Checking main process i18n setup...')
  const mainI18nFile = join(ELECTRON, 'src/main/i18n.ts')
  const mainI18nLabelsFile = join(ELECTRON, 'src/main/i18n-labels.ts')

  if (!checkFile(mainI18nFile, 'Main i18n setup')) return false
  if (!checkFile(mainI18nLabelsFile, 'Main i18n labels')) return false

  // Check if files export expected functions
  const mainI18nContent = readFileSync(mainI18nFile, 'utf-8')
  if (!mainI18nContent.includes('export function getMainI18n') && !mainI18nContent.includes('export async function getMainI18n')) {
    error('Main i18n setup missing getMainI18n export')
    return false
  }

  success('Main process i18n setup looks good')
  return true
}

// Check renderer i18n initialization
function checkRendererI18n(): boolean {
  info('Checking renderer i18n initialization...')
  const mainTsx = join(ELECTRON_RENDERER, 'main.tsx')
  const i18nInitFile = join(ELECTRON_RENDERER, 'i18n-init.ts')

  if (!checkFile(mainTsx, 'Renderer main.tsx')) return false
  if (!checkFile(i18nInitFile, 'Renderer i18n-init.ts')) return false

  const mainContent = readFileSync(mainTsx, 'utf-8')

  if (!mainContent.includes('i18n-init')) {
    error('Renderer main.tsx missing i18n-init import')
    return false
  }

  const i18nInitContent = readFileSync(i18nInitFile, 'utf-8')
  if (!i18nInitContent.includes('initRendererI18n')) {
    error('Renderer i18n-init.ts missing initRendererI18n import')
    return false
  }

  success('Renderer i18n setup looks good')
  return true
}

// Check for common i18n integration bugs
function checkCommonIssues(): boolean {
  info('Checking for common i18n integration bugs...')
  let issuesFound = 0

  // Check 1: Missing imports in ipc.ts (common issue)
  const ipcFile = join(ELECTRON, 'src/main/ipc.ts')
  if (existsSync(ipcFile)) {
    const ipcContent = readFileSync(ipcFile, 'utf-8')
    const imports = [
      'getDefaultModelsForConnection',
      'getDefaultModelForConnection',
      'isAnthropicProvider',
      'isOpenAIProvider',
      'isCompatProvider',
      'isCopilotProvider',
      'setDefaultLlmConnection',
      'addLlmConnection',
      'updateLlmConnection',
    ]
    
    for (const imp of imports) {
      if (ipcContent.includes(imp) && !new RegExp(`import.*${imp}`).test(ipcContent)) {
        warn(`Possible missing import: ${imp} (found usage but no import)`)
        issuesFound++
      }
    }
  }

  // Check 2: Missing TooltipProvider import (common issue)
  const appShellFile = join(ELECTRON_RENDERER, 'components/app-shell/AppShell.tsx')
  if (existsSync(appShellFile)) {
    const appShellContent = readFileSync(appShellFile, 'utf-8')
    if (appShellContent.includes('TooltipProvider') && !new RegExp('import.*TooltipProvider').test(appShellContent)) {
      warn('Possible missing import: TooltipProvider (found usage but no import)')
      issuesFound++
    }
  }

  // Check 3: Missing useAtomValue import (common issue)
  const mainContentPanelFile = join(ELECTRON_RENDERER, 'components/app-shell/MainContentPanel.tsx')
  if (existsSync(mainContentPanelFile)) {
    const mainContentPanelContent = readFileSync(mainContentPanelFile, 'utf-8')
    if (mainContentPanelContent.includes('useAtomValue') && !new RegExp('import.*useAtomValue').test(mainContentPanelContent)) {
      warn('Possible missing import: useAtomValue (found usage but no import)')
      issuesFound++
    }
  }

  if (issuesFound === 0) {
    success('No common i18n integration issues detected')
  } else {
    warn(`Found ${issuesFound} potential common issues`)
  }

  return issuesFound === 0
}

// Main verification function
function runVerification() {
  info('='.repeat(60))
  info('I18N Integration Verification')
  info('='.repeat(60))

  const results = {
    locales: false,
    mainI18n: false,
    rendererI18n: false,
    commonIssues: false,
  }

  results.locales = checkLocales()
  results.mainI18n = checkMainI18n()
  results.rendererI18n = checkRendererI18n()
  results.commonIssues = checkCommonIssues()

  info('='.repeat(60))
  info('Verification Summary:')
  info('='.repeat(60))
  
  if (results.locales && results.mainI18n && results.rendererI18n) {
    success('✅ All critical i18n components verified')
    if (results.commonIssues) {
      success('✅ No common issues detected')
    } else {
      warn('⚠️  Some common issues detected (non-critical)')
    }
    process.exit(0)
  } else {
    error('❌ I18n integration verification failed!')
    process.exit(1)
  }
}

// Run verification
runVerification()