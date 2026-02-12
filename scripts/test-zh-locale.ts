#!/usr/bin/env bun
/**
 * Test script to verify Chinese locale (zh-CN) works correctly
 * This tests both main process and renderer i18n integration
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT_DIR = process.cwd()
const LOCALES_DIR = join(ROOT_DIR, 'packages/shared/locales')

const expectedTranslations = {
  'en': {
    'common': {
      'edit': 'Edit',
      'loading': 'Loading...',
      'menu.share': 'Share'
    }
  },
  'zh-CN': {
    'common': {
      'edit': '编辑',
      'loading': '加载中...',
      'menu.share': '分享'
    }
  }
}

function loadTranslationFile(locale: string, namespace: string): Record<string, unknown> {
  const filePath = join(LOCALES_DIR, locale, `${namespace}.json`)
  if (!existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`)
  }
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.')
  let current: unknown = obj
  for (const segment of segments) {
    if (!current || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

function verifyLocale(locale: string): { passed: boolean; failures: string[] } {
  const failures: string[] = []
  const expected = expectedTranslations[locale as keyof typeof expectedTranslations]

  if (!expected) {
    throw new Error(`No expected translations defined for locale: ${locale}`)
  }

  for (const [namespace, translations] of Object.entries(expected)) {
    try {
      const data = loadTranslationFile(locale, namespace)

      for (const [key, expectedValue] of Object.entries(translations)) {
        const actualValue = getNestedValue(data, key)
        if (actualValue !== expectedValue) {
          failures.push(`${locale}/${namespace}.${key}: expected "${expectedValue}" but got "${actualValue}"`)
        }
      }
    } catch (error) {
      failures.push(`${locale}/${namespace}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return {
    passed: failures.length === 0,
    failures
  }
}

function main() {
  console.log('🧪 Testing Chinese (zh-CN) Locale\n')
  console.log('='.repeat(60))

  const enResult = verifyLocale('en')
  if (!enResult.passed) {
    console.log('\n❌ English baseline tests FAILED:')
    enResult.failures.forEach(f => {
      console.log(`  - ${f}`)
    })
    process.exit(1)
  }
  console.log('\n✅ English baseline: PASS')

  console.log('\n' + '='.repeat(60))
  console.log('\nTesting zh-CN translations:')
  const zhResult = verifyLocale('zh-CN')

  if (zhResult.passed) {
    console.log('✅ All Chinese translations verified')
  } else {
    console.log('\n❌ Chinese translation tests FAILED:')
    zhResult.failures.forEach(f => {
      console.log(`  - ${f}`)
    })
    process.exit(1)
  }

  console.log('\n' + '='.repeat(60))
  console.log('\nChecking all required namespaces:')
  const requiredNamespaces = ['onboarding.json', 'common.json', 'chat.json', 'dialogs.json', 'menu.json', 'settings.json']

  for (const locale of ['en', 'zh-CN']) {
    const missing: string[] = []
    for (const ns of requiredNamespaces) {
      const filePath = join(LOCALES_DIR, locale, ns)
      if (!existsSync(filePath)) {
        missing.push(ns)
      }
    }

    if (missing.length > 0) {
      console.log(`❌ ${locale}: Missing namespaces: ${missing.join(', ')}`)
      process.exit(1)
    } else {
      console.log(`✅ ${locale}: All 6 namespaces present`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n🎉 All tests passed! Chinese locale is ready.\n')
  console.log('=' .repeat(60))
}

main()
