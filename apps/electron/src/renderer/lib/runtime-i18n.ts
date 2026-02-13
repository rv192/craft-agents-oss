type TranslationMap = Record<string, string>

type RuntimeI18nGuardInput = {
  enabled: boolean
  locale: string
  route: string
  whitelist: string[]
}

const TRANSLATABLE_ATTRIBUTES = ['title', 'placeholder', 'aria-label'] as const

const RUNTIME_LITERAL_OVERRIDES: Record<string, string> = {
  'Notifications and updates': '通知与更新',
  Interface: '界面',
  General: '常规',
  'List Navigation': '列表导航',
  'Chat Input': '聊天输入',
  'Default Sources': '默认来源',
  'Settings for new chats when no workspace override is set.': '用于新聊天的设置（当未设置工作区覆盖时）。',
  'API connection for new chats': '新聊天的 API 连接',
  'API Connections for new chats': '新聊天的 API 连接',
  'Workspace Overrides': '工作区覆盖',
  'Override default settings per workspace.': '按工作区覆盖默认设置。',
  'Using defaults': '使用默认值',
  'Using Defaults': '使用默认值',
  'Use default': '使用默认值',
  'Inherit from app settings': '继承应用设置',
  Power: '电源',
  'Keep screen awake': '保持屏幕常亮',
  'Prevent the screen from turning off while sessions are running': '在会话运行期间防止屏幕关闭',
  'Prevent the screen from turning off while sessions are running.': '在会话运行期间防止屏幕关闭。',
  Model: '模型',
  thinking: '思考',
  connections: '连接',
  'Model,thinking,connections': '模型、思考、连接',
  'Model, thinking, connections': '模型、思考、连接',
  Connections: '连接',
  'Manage your AI provider connections.': '管理你的 AI 提供商连接。',
  'Custom Anthropic-Compatible': '自定义 Anthropic 兼容连接',
  'Re-authenticate': '重新认证',
  'Validate Connection': '验证连接',
  'Add Connection': '添加连接',
  '+ Add Connection': '+ 添加连接',
  'Ask then edit': '询问后编辑',
  'Ask Then Edit': '询问后编辑',
  'Ask to Edit': '询问后编辑',
  'Read-only, no changes allowed': '只读，不允许更改',
  'Prompts before making edits': '编辑前提示确认',
  'Full autonomous execution': '完全自动执行',
  'Explore mode rules': '探索模式规则',
  'Keyboard shortcuts': '键盘快捷键',
  Quit: '退出',
  'Quit the application': '退出应用程序',
  'Toggle Theme': '切换主题',
  'Focus Sidebar': '聚焦侧边栏',
  'Focus Session List': '聚焦会话列表',
  'Focus Chat': '聚焦聊天',
  'Focus Next Zone': '聚焦下一区域',
  'Select All Sessions': '选择所有会话',
  'Clear Selection': '清除选择',
  'Stop Processing': '停止处理',
  'Cycle Permission Mode': '切换权限模式',
  'Next Search Match': '下一个搜索匹配',
  'Previous Search Match': '上一个搜索匹配',
  'Open context menu': '打开上下文菜单',
  'Go Back': '返回',
  'Go Forward': '前进',
  'User preferences': '用户偏好',
  'User preferencences': '用户偏好',
  Name: '名称',
  Icon: '图标',
  'working directory': '工作目录',
  'Name,icon,working directory': '名称、图标、工作目录',
  'Name, icon, working directory': '名称、图标、工作目录',
  'spell check': '拼写检查',
  'Send key,spell check': '发送键、拼写检查',
  'Send key, spell check': '发送键、拼写检查',
  'Manage session labels': '管理会话标签',
  Development: '开发',
  Bug: '缺陷',
  Automation: '自动化',
  Content: '内容',
  Writing: '写作',
  Research: '研究',
  Design: '设计',
  Priority: '优先级',
  Project: '项目',
  Number: '数字',
  String: '字符串',
  Code: '代码',
  Allowed: '允许',
  'Read-only exploration.Blockswrites,never prompts.': '只读探索。阻止写入，且从不提示。',
  'Promptsbefore making edits.': '编辑前提示确认。',
  'Automatic execution,no prompts.': '自动执行，不提示。',
  Language: '语言',
  'Display language for the app interface.': '应用界面的显示语言。',
  'Follow System': '跟随系统',
  Notes: '备注',
  "Any additional context you'd like Craft Agent to know...": '任何你希望 Craft Agent 了解的额外信息...',
  "Any additional context you'd like Craft Agent to know…": '任何你希望 Craft Agent 了解的额外信息...',
  'Connection icons': '连接图标',
  'Show provider icons in the session list and model selector': '在会话列表和模型选择器中显示提供商图标',
  'Rich tool descriptions': '丰富工具描述',
  'Add action names and intent descriptions to all tool calls. Provides richer activity context in sessions.':
    '为所有工具调用添加动作名称和意图说明，为会话提供更丰富的活动上下文。',
  'Sources auto-enabled for new sessions': '新会话自动启用的来源',
  'No sources configured in this workspace.': '此工作区尚未配置来源。',
  'No sources configured': '尚未配置来源',
  'No sources configured.': '尚未配置来源。',
  'No local folder sources configured.': '尚未配置本地文件夹来源。',
  'No local folder sources configured': '尚未配置本地文件夹来源',
  'No MCP sources configured.': '尚未配置 MCP 来源。',
  'No MCP sources configured': '尚未配置 MCP 来源',
  'No API sources configured.': '尚未配置 API 来源。',
  'No API sources configured': '尚未配置 API 来源',
  'No sessions yet': '还没有会话',
  'Sessions with your agent appear here. Start one to get going.': '与智能体的会话将显示在这里。开始一个会话吧。',
  'No archived sessions': '没有已归档会话',
  'Sessions you archive will appear here. Archive sessions to keep your list tidy while preserving conversations.': '已归档的会话将显示在这里。归档会话可以让列表保持整洁，同时保留对话内容。',
  'All Sessions': '所有会话',
  'All Skills': '所有技能',
  'Archived': '已归档',
  'Flagged': '已标记',
  'Status': '状态',
  'Labels': '标签',
  'Sources': '来源',
  'Skills': '技能',
  'Views': '视图',
  'Settings': '设置',
  'APIs': 'API',
  'MCPs': 'MCP',
  'Local Folders': '本地文件夹',
  'New Session': '新会话',
  'Cancelled': '已取消',
}

const RUNTIME_SUBSTRING_OVERRIDES: Record<string, string> = {
  'Permissions control how much autonomy your agent has. In': '权限决定智能体的自主程度。在',
  'mode, the agent can only read and research — perfect for understanding a problem before committing to changes. When you\'re ready, switch to':
    '模式下，智能体只能阅读和研究，非常适合理解问题再开始修改。当你准备好后，切换到',
  'mode to let the agent implement the plan autonomously.': '模式即可让智能体自动实施计划。',
  'Read-only exploration.': '只读探索。',
  'Blocks writes, never prompts.': '阻止写入，且从不提示。',
  'Prompts before making edits.': '编辑前提示确认。',
  'Automatic execution, no prompts.': '自动执行，不提示。',
}

function normalizeLocale(locale: string): string {
  return locale.replace('_', '-').toLowerCase()
}

function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function shouldSkipElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase()
  return tag === 'code' || tag === 'pre' || tag === 'textarea'
}

export function shouldEnableRuntimeI18n(input: RuntimeI18nGuardInput): boolean {
  if (!input.enabled) return false

  const locale = normalizeLocale(input.locale)
  if (!locale.startsWith('zh')) return false

  const route = input.route.trim()
  if (!route) return false

  return input.whitelist.some((prefix) => route === prefix || route.startsWith(`${prefix}/`))
}

export function buildLiteralTranslationMap(
  sourceLocaleTree: unknown,
  targetLocaleTree: unknown,
): TranslationMap {
  const map: TranslationMap = {}

  const walkPair = (sourceNode: unknown, targetNode: unknown): void => {
    if (!sourceNode || !targetNode) return

    if (typeof sourceNode === 'string' && typeof targetNode === 'string') {
      const source = normalizeText(sourceNode)
      const target = normalizeText(targetNode)
      if (source && target) {
        map[source] = targetNode
      }
      return
    }

    if (typeof sourceNode !== 'object' || typeof targetNode !== 'object') return

    const sourceEntries = Object.entries(sourceNode as Record<string, unknown>)
    for (const [key, sourceValue] of sourceEntries) {
      const targetValue = (targetNode as Record<string, unknown>)[key]
      walkPair(sourceValue, targetValue)
    }
  }

  walkPair(sourceLocaleTree, targetLocaleTree)
  return map
}

export function translateText(text: string, map: TranslationMap): string {
  const key = normalizeText(text)
  return map[key] ?? text
}

function applySubstringOverrides(text: string): string {
  let next = text
  for (const [source, target] of Object.entries(RUNTIME_SUBSTRING_OVERRIDES)) {
    if (next.includes(source)) {
      next = next.replaceAll(source, target)
    }
  }
  return next
}

export function applyRuntimeTranslationOverrides(map: TranslationMap): TranslationMap {
  const next = { ...map }

  for (const [source, target] of Object.entries(RUNTIME_LITERAL_OVERRIDES)) {
    next[normalizeText(source)] = target
  }

  return next
}

export function getRuntimeLiteralOverrides(): Record<string, string> {
  return { ...RUNTIME_LITERAL_OVERRIDES }
}

export function createRuntimeI18nPilot(options?: {
  flag?: boolean
  whitelist?: string[]
  routeProvider?: () => string
  localeProvider?: () => string
}) {
  const enabledByFlag = options?.flag ?? false
  const whitelist = options?.whitelist ?? ['settings', 'allSessions', 'flagged', 'archived', 'state', 'label', 'view', 'sources', 'skills']
  const getRoute = options?.routeProvider ?? (() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('route') ?? ''
  })
  const getLocale = options?.localeProvider ?? (() => navigator.language)

  let observer: MutationObserver | null = null
  let processingQueued = false
  const pendingMutations: MutationRecord[] = []

  const shouldRun = () => shouldEnableRuntimeI18n({
    enabled: enabledByFlag,
    locale: getLocale(),
    route: getRoute(),
    whitelist,
  })

  const translateTextNode = (node: Text, map: TranslationMap) => {
    const original = node.textContent ?? ''
    const trimmed = normalizeText(original)
    if (!trimmed) return
    const translated = map[trimmed]
    if (translated) {
      node.textContent = original.replace(trimmed, translated)
      return
    }

    const patched = applySubstringOverrides(original)
    if (patched !== original) {
      node.textContent = patched
    }
  }

  const translateElement = (el: Element, map: TranslationMap) => {
    if (shouldSkipElement(el)) return

    for (const attr of TRANSLATABLE_ATTRIBUTES) {
      const value = el.getAttribute(attr)
      if (!value) continue
      const translated = map[normalizeText(value)]
      if (!translated) continue
      el.setAttribute(attr, translated)
    }

    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        translateTextNode(child as Text, map)
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        translateElement(child as Element, map)
      }
    }
  }

  const start = (resources: { source: unknown; target: unknown }) => {
    if (!shouldRun()) return false
    const map = applyRuntimeTranslationOverrides(
      buildLiteralTranslationMap(resources.source, resources.target),
    )
    if (Object.keys(map).length === 0) return false

    translateElement(document.body, map)

    observer?.disconnect()
    observer = new MutationObserver((mutations) => {
      if (!shouldRun()) return

      pendingMutations.push(...mutations)
      if (processingQueued) return
      processingQueued = true

      queueMicrotask(() => {
        processingQueued = false
        if (!shouldRun()) {
          pendingMutations.length = 0
          return
        }

        const batch = pendingMutations.splice(0, pendingMutations.length)
        for (const mutation of batch) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
              translateTextNode(node as Text, map)
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              translateElement(node as Element, map)
            }
          }
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return true
  }

  const stop = () => {
    observer?.disconnect()
    observer = null
  }

  return { start, stop, shouldRun }
}
