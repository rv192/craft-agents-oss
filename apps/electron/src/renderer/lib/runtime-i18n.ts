type TranslationMap = Record<string, string>

type RuntimeI18nGuardInput = {
  enabled: boolean
  locale: string
  route: string
  whitelist: string[]
}

const TRANSLATABLE_ATTRIBUTES = ['title', 'placeholder', 'aria-label'] as const

/**
 * Runtime literal overrides - ONLY for dynamic or concatenated text
 * 
 * NOTE: Most translations have been migrated to resource files:
 * - packages/shared/locales/zh-CN/settings.json
 * - packages/shared/locales/zh-CN/common.json
 * 
 * This map should only contain:
 * 1. Dynamic text from external configs (e.g., status labels from user config)
 * 2. Concatenated/generated text that can't be keyed
 * 3. Third-party library text
 * 
 * DO NOT add static UI text here - use resource files instead.
 */
const RUNTIME_LITERAL_OVERRIDES: Record<string, string> = {
  // Dynamic status labels (from user config, cannot be predetermined)
  // These come from workspace status configuration
  'Backlog': '待办事项',
  'Todo': '待办',
  'In Progress': '进行中',
  'Needs Review': '需要审核',
  'Done': '已完成',
  'Cancelled': '已取消',
  
  // Concatenated text variants (punctuation/formatting differences)
  // These are variations of text that's in resource files but with different punctuation
  'Using defaults': '使用默认值',
  'Using Defaults': '使用默认值',
  'Name,icon,working directory': '名称、图标、工作目录',
  'Name, icon, working directory': '名称、图标、工作目录',
  'Send key,spell check': '发送键、拼写检查',
  'Send key, spell check': '发送键、拼写检查',
  'Promptsbefore making edits.': '编辑前提示确认。',
  'Automatic execution,no prompts.': '自动执行，不提示。',
  'Read-only exploration.Blockswrites,never prompts.': '只读探索。阻止写入，且从不提示。',
  
  // Typo variants that exist in source code
  'User preferencences': '用户偏好',
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
  const whitelist = options?.whitelist ?? ['settings']
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
