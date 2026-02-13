import { describe, expect, it } from 'bun:test'
import {
  applyRuntimeTranslationOverrides,
  buildLiteralTranslationMap,
  createRuntimeI18nPilot,
  shouldEnableRuntimeI18n,
  translateText,
} from '../runtime-i18n'
import { settlePromiseWithTimeout } from '../promise-timeout'

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

  it('enables for non-settings routes when route prefix is in whitelist', () => {
    const enabled = shouldEnableRuntimeI18n({
      enabled: true,
      locale: 'zh-CN',
      route: '/allSessions/session/abc123',
      whitelist: ['/settings', '/allSessions'],
    })

    expect(enabled).toBe(true)
  })

  it('defaults to running for allSessions route in zh locale when pilot flag is enabled', () => {
    const pilot = createRuntimeI18nPilot({
      flag: true,
      localeProvider: () => 'zh-CN',
      routeProvider: () => 'allSessions/session/abc123',
    })

    expect(pilot.shouldRun()).toBe(true)
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

  it('adds pilot literal overrides for known uncovered settings strings', () => {
    const map = applyRuntimeTranslationOverrides({})

    expect(map['Notifications and updates']).toBe('通知与更新')
    expect(map['Settings for new chats when no workspace override is set.']).toBe('用于新聊天的设置（当未设置工作区覆盖时）。')
    expect(map['API connection for new chats']).toBe('新聊天的 API 连接')
    expect(map['Workspace Overrides']).toBe('工作区覆盖')
    expect(map['Override default settings per workspace.']).toBe('按工作区覆盖默认设置。')
    expect(map['Using defaults']).toBe('使用默认值')
    expect(map['Using Defaults']).toBe('使用默认值')
    expect(map['Use default']).toBe('使用默认值')
    expect(map['Inherit from app settings']).toBe('继承应用设置')
    expect(map['Power']).toBe('电源')
    expect(map['Keep screen awake']).toBe('保持屏幕常亮')
    expect(map['Prevent the screen from turning off while sessions are running']).toBe('在会话运行期间防止屏幕关闭')
    expect(map['Model,thinking,connections']).toBe('模型、思考、连接')
    expect(map['Model, thinking, connections']).toBe('模型、思考、连接')
    expect(map['Manage your AI provider connections.']).toBe('管理你的 AI 提供商连接。')
    expect(map['Re-authenticate']).toBe('重新认证')
    expect(map['Validate Connection']).toBe('验证连接')
    expect(map['Add Connection']).toBe('添加连接')
    expect(map['Interface']).toBe('界面')
    expect(map['General']).toBe('常规')
    expect(map['List Navigation']).toBe('列表导航')
    expect(map['Chat Input']).toBe('聊天输入')
    expect(map['Default Sources']).toBe('默认来源')
    expect(map['Ask to Edit']).toBe('询问后编辑')
    expect(map['Read-only, no changes allowed']).toBe('只读，不允许更改')
    expect(map['Prompts before making edits']).toBe('编辑前提示确认')
    expect(map['Full autonomous execution']).toBe('完全自动执行')
    expect(map['Toggle Theme']).toBe('切换主题')
    expect(map['Focus Sidebar']).toBe('聚焦侧边栏')
    expect(map['Focus Session List']).toBe('聚焦会话列表')
    expect(map['Focus Chat']).toBe('聚焦聊天')
    expect(map['Focus Next Zone']).toBe('聚焦下一区域')
    expect(map['Select All Sessions']).toBe('选择所有会话')
    expect(map['Clear Selection']).toBe('清除选择')
    expect(map['Stop Processing']).toBe('停止处理')
    expect(map['Cycle Permission Mode']).toBe('切换权限模式')
    expect(map['Next Search Match']).toBe('下一个搜索匹配')
    expect(map['Previous Search Match']).toBe('上一个搜索匹配')
    expect(map['Open context menu']).toBe('打开上下文菜单')
    expect(map['Go Back']).toBe('返回')
    expect(map['Go Forward']).toBe('前进')
    expect(map['Send key,spell check']).toBe('发送键、拼写检查')
    expect(map['Send key, spell check']).toBe('发送键、拼写检查')
    expect(map['Name,icon,working directory']).toBe('名称、图标、工作目录')
    expect(map['Name, icon, working directory']).toBe('名称、图标、工作目录')
    expect(map['Manage session labels']).toBe('管理会话标签')
    expect(map['Development']).toBe('开发')
    expect(map['Bug']).toBe('缺陷')
    expect(map['Automation']).toBe('自动化')
    expect(map['Content']).toBe('内容')
    expect(map['Writing']).toBe('写作')
    expect(map['Research']).toBe('研究')
    expect(map['Design']).toBe('设计')
    expect(map['Priority']).toBe('优先级')
    expect(map['Project']).toBe('项目')
    expect(map['Number']).toBe('数字')
    expect(map['String']).toBe('字符串')
    expect(map['Code']).toBe('代码')
    expect(map['Read-only exploration.Blockswrites,never prompts.']).toBe('只读探索。阻止写入，且从不提示。')
    expect(map['Promptsbefore making edits.']).toBe('编辑前提示确认。')
    expect(map['Automatic execution,no prompts.']).toBe('自动执行，不提示。')
    expect(map['Language']).toBe('语言')
    expect(map['Display language for the app interface.']).toBe('应用界面的显示语言。')
    expect(map['Follow System']).toBe('跟随系统')
    expect(map['Notes']).toBe('备注')
    expect(map["Any additional context you'd like Craft Agent to know..."]).toBe('任何你希望 Craft Agent 了解的额外信息...')
  })

  it('does not include permission table PowerShell comment overrides in pilot boundary', () => {
    const map = applyRuntimeTranslationOverrides({})

    expect(map['PowerShell: List directory contents (dir/ls equivalent)']).toBeUndefined()
    expect(map['PowerShell: Read file contents (cat equivalent)']).toBeUndefined()
    expect(map['Allowed']).toBe('允许')
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
