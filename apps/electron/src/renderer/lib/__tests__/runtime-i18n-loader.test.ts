import { describe, expect, it } from 'bun:test'
import { buildLocaleResources, getLocaleGlobPatternForTest } from '../runtime-i18n-loader'
import enCommon from '../../../../../../packages/shared/locales/en/common.json'
import zhCommon from '../../../../../../packages/shared/locales/zh-CN/common.json'

describe('runtime i18n loader', () => {
  it('uses locale glob pattern that reaches repository-level packages/shared', () => {
    expect(getLocaleGlobPatternForTest()).toBe('../../../../../packages/shared/locales/{en,zh-CN}/*.json')
  })

  it('keeps sidebar status literals in runtime fallback maps', () => {
    const sourceMap = enCommon.runtimeFallback.literalMap as Record<string, string>
    const targetMap = zhCommon.runtimeFallback.literalMap as Record<string, string>

    expect(sourceMap.Backlog).toBe('Backlog')
    expect(sourceMap.Todo).toBe('Todo')
    expect(sourceMap['Needs Review']).toBe('Needs Review')
    expect(sourceMap.Cancelled).toBe('Cancelled')

    expect(targetMap.Backlog).toBe('待办事项')
    expect(targetMap.Todo).toBe('待办')
    expect(targetMap['Needs Review']).toBe('需要审核')
    expect(targetMap.Cancelled).toBe('已取消')
  })

  it('keeps remaining chat input fallback literals for command search and shortcut hints', () => {
    const sourceMap = enCommon.runtimeFallback.literalMap as Record<string, string>
    const targetMap = zhCommon.runtimeFallback.literalMap as Record<string, string>

    expect(sourceMap['Search commands...']).toBe('Search commands...')
    expect(sourceMap['Filter statuses...']).toBe('Filter statuses...')
    expect(sourceMap['Press ⌘ + B to toggle the sidebar']).toBe('Press ⌘ + B to toggle the sidebar')
    expect(sourceMap['Press Ctrl + B to toggle the sidebar']).toBe('Press Ctrl + B to toggle the sidebar')
    expect(sourceMap['Press + B to toggle the sidebar']).toBe('Press + B to toggle the sidebar')
    expect(sourceMap['Press ⌘ + . for focus mode']).toBe('Press ⌘ + . for focus mode')
    expect(sourceMap['Press Ctrl + . for focus mode']).toBe('Press Ctrl + . for focus mode')
    expect(sourceMap['Press + . for focus mode']).toBe('Press + . for focus mode')

    expect(targetMap['Search commands...']).toBe('搜索命令...')
    expect(targetMap['Filter statuses...']).toBe('筛选状态...')
    expect(targetMap['Press ⌘ + B to toggle the sidebar']).toBe('按 ⌘ + B 切换侧边栏')
    expect(targetMap['Press Ctrl + B to toggle the sidebar']).toBe('按 Ctrl + B 切换侧边栏')
    expect(targetMap['Press + B to toggle the sidebar']).toBe('按 + B 切换侧边栏')
    expect(targetMap['Press ⌘ + . for focus mode']).toBe('按 ⌘ + . 切换专注模式')
    expect(targetMap['Press Ctrl + . for focus mode']).toBe('按 Ctrl + . 切换专注模式')
    expect(targetMap['Press + . for focus mode']).toBe('按 + . 切换专注模式')
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
