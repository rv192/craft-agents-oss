import { describe, expect, it } from 'bun:test'
import { LOCALE_GLOB_PATTERN, buildLocaleResources } from '../runtime-i18n-loader'

describe('runtime i18n loader', () => {
  it('uses locale glob pattern that reaches repository-level packages/shared', () => {
    expect(LOCALE_GLOB_PATTERN).toBe('../../../../../packages/shared/locales/{en,zh-CN}/*.json')
  })

  it('builds namespace resources for a locale from locale modules', () => {
    const localeModules = {
      '/x/locales/en/common.json': { default: { a: 'A' } },
      '/x/locales/en/settings.json': { default: { b: 'B' } },
      '/x/locales/zh-CN/common.json': { default: { a: '甲' } },
      '/x/locales/zh-CN/settings.json': { default: { b: '乙' } },
    }

    const result = buildLocaleResources(localeModules, 'zh-CN', ['common', 'settings'])

    expect(result.common).toEqual({ a: '甲' })
    expect(result.settings).toEqual({ b: '乙' })
  })

  it('skips missing namespaces without throwing', () => {
    const localeModules = {
      '/x/locales/en/common.json': { default: { a: 'A' } },
    }

    const result = buildLocaleResources(localeModules, 'en', ['common', 'chat'])

    expect(result.common).toEqual({ a: 'A' })
    expect(result.chat).toBeUndefined()
  })
})
