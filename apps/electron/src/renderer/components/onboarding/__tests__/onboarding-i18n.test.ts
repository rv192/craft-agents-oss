import { describe, expect, it } from 'bun:test'
import type { TFunction } from 'i18next'
import { getWelcomeLabels, getReauthLabels } from '../labels'

describe('onboarding i18n', () => {
  it('returns localized welcome labels', () => {
    const t: TFunction = ((key: string) => ({
      'onboarding:welcome.title': '欢迎使用 Craft Agents',
      'onboarding:welcome.cta': '开始',
      'onboarding:welcome.description': '欢迎文案',
      'onboarding:welcome.titleExisting': '更新设置',
      'onboarding:welcome.descriptionExisting': '更新说明',
      'onboarding:welcome.ctaExisting': '继续',
      'onboarding:welcome.loading': '正在检查...',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getWelcomeLabels(t)
    expect(labels.title).toBe('欢迎使用 Craft Agents')
    expect(labels.titleExisting).toBe('更新设置')
    expect(labels.description).toBe('欢迎文案')
    expect(labels.descriptionExisting).toBe('更新说明')
    expect(labels.cta).toBe('开始')
    expect(labels.ctaExisting).toBe('继续')
    expect(labels.loading).toBe('正在检查...')
  })

  it('returns localized reauth labels', () => {
    const t: TFunction = ((key: string) => ({
      'onboarding:reauth.title': '会话已过期',
      'onboarding:reauth.description': '请重新登录。',
      'onboarding:reauth.descriptionSecondary': '请重新登录以继续使用 Craft Agents。',
      'onboarding:reauth.note': '你的会话已保留。',
      'onboarding:reauth.login': '重新登录',
      'onboarding:reauth.loggingIn': '正在登录...',
      'onboarding:reauth.reset': '重置并重新开始...',
      'onboarding:reauth.error': '登录失败',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getReauthLabels(t)
    expect(labels.title).toBe('会话已过期')
    expect(labels.description).toBe('请重新登录。')
    expect(labels.descriptionSecondary).toBe('请重新登录以继续使用 Craft Agents。')
    expect(labels.note).toBe('你的会话已保留。')
    expect(labels.login).toBe('重新登录')
    expect(labels.loggingIn).toBe('正在登录...')
    expect(labels.reset).toBe('重置并重新开始...')
    expect(labels.error).toBe('登录失败')
  })
})
