import { describe, expect, it } from 'bun:test'
import {
  applyRuntimeTranslationOverrides,
  buildRuntimeTranslationOverrides,
  buildLiteralTranslationMap,
  shouldEnableRuntimeI18n,
  translateText,
} from '../runtime-i18n'

type SettledResult<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: unknown }
  | { status: 'timeout' }

async function settlePromiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<SettledResult<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const timeoutPromise = new Promise<SettledResult<T>>((resolve) => {
    timeoutId = setTimeout(() => resolve({ status: 'timeout' }), timeoutMs)
  })

  const settledPromise = promise
    .then((value) => ({ status: 'fulfilled', value } as const))
    .catch((reason) => ({ status: 'rejected', reason } as const))

  const result = await Promise.race([settledPromise, timeoutPromise])

  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  return result
}

describe('runtime i18n pilot guards', () => {
  it('enables only when flag is on, locale is zh-CN, and route is whitelisted', () => {
    const enabled = shouldEnableRuntimeI18n({
      enabled: true,
      locale: 'zh-CN',
      route: '/settings/profile',
      whitelist: ['/settings'],
    })

    expect(enabled).toBe(true)
  })

  it('disables when feature flag is off', () => {
    const enabled = shouldEnableRuntimeI18n({
      enabled: false,
      locale: 'zh-CN',
      route: '/settings/profile',
      whitelist: ['/settings'],
    })

    expect(enabled).toBe(false)
  })

  it('disables when route is not whitelisted', () => {
    const enabled = shouldEnableRuntimeI18n({
      enabled: true,
      locale: 'zh-CN',
      route: '/chat',
      whitelist: ['/settings'],
    })

    expect(enabled).toBe(false)
  })

  it('disables for non-Chinese locale', () => {
    const enabled = shouldEnableRuntimeI18n({
      enabled: true,
      locale: 'en',
      route: '/settings/profile',
      whitelist: ['/settings'],
    })

    expect(enabled).toBe(false)
  })

  it('allows runtime pilot when route is empty in zh locale with feature enabled', () => {
    const enabled = shouldEnableRuntimeI18n({
      enabled: true,
      locale: 'zh-CN',
      route: '',
      whitelist: ['/settings', '/allSessions'],
    })

    expect(enabled).toBe(true)
  })
})

describe('runtime i18n translation map', () => {
  it('builds literal translation map from source and target locale trees', () => {
    const map = buildLiteralTranslationMap(
      {
        common: {
          menu: {
            open: 'Open',
          },
          close: 'Close',
        },
      },
      {
        common: {
          menu: {
            open: '打开',
          },
          close: '关闭',
        },
      },
    )

    expect(map['Open']).toBe('打开')
    expect(map['Close']).toBe('关闭')
  })

  it('translates exact text and preserves unknown text', () => {
    const map = {
      Settings: '设置',
      Open: '打开',
    }

    expect(translateText('Settings', map)).toBe('设置')
    expect(translateText('Unknown', map)).toBe('Unknown')
  })

  it('applies runtime literal overrides provided from resource files', () => {
    const map = applyRuntimeTranslationOverrides(
      {},
      {
        literal: {
          Quit: '退出',
          "Any additional context you'd like Craft Agent to know...": '任何你希望 Craft Agent 了解的额外信息...',
        },
      },
    )

    expect(map['Quit']).toBe('退出')
    expect(map["Any additional context you'd like Craft Agent to know..."]).toBe('任何你希望 Craft Agent 了解的额外信息...')
  })

  it('builds runtime overrides from source/target locale trees', () => {
    const overrides = buildRuntimeTranslationOverrides(
      {
        literal: {
          Quit: 'Quit',
        },
        substring: {
          'Prompts before making edits.': 'Prompts before making edits.',
        },
      },
      {
        literal: {
          Quit: '退出',
        },
        substring: {
          'Prompts before making edits.': '编辑前提示确认。',
        },
      },
    )

    expect(overrides.literal['Quit']).toBe('退出')
    expect(overrides.substring['Prompts before making edits.']).toBe('编辑前提示确认。')
  })

  it('does not inject hardcoded runtime overrides when no resource overrides are provided', () => {
    const map = applyRuntimeTranslationOverrides({}, { literal: {} })

    expect(map['Quit']).toBeUndefined()
    expect(map["Any additional context you'd like Craft Agent to know..."]).toBeUndefined()
  })
})

describe('promise timeout utility', () => {
  it('returns timed_out when promise does not settle before timeout', async () => {
    const neverSettles = new Promise<string>(() => {})

    const result = await settlePromiseWithTimeout(neverSettles, 10)

    expect(result).toEqual({ status: 'timed_out' })
  })

  it('returns resolved when promise settles before timeout', async () => {
    const result = await settlePromiseWithTimeout(Promise.resolve('ok'), 100)

    expect(result).toEqual({ status: 'resolved', value: 'ok' })
  })

  it('returns rejected when promise rejects before timeout', async () => {
    const error = new Error('boom')
    const result = await settlePromiseWithTimeout(Promise.reject(error), 100)

    expect(result).toEqual({ status: 'rejected', reason: error })
  })
})
