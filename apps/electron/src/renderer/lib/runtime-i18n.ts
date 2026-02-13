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
  'What should I modify?': '你希望我改哪里？',
  'Just tell me what to change': '直接告诉我改什么',
  'Describe the update': '描述你的修改',
  "Any additional context you'd like Craft Agent to know...": '任何你希望 Craft Agent 了解的额外信息...',
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
    .replace(/'/g, "'")
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
    for (const attr of TRANSLATABLE_ATTRIBUTES) {
      const value = el.getAttribute(attr)
      if (value) {
        const translated = translateText(value, map)
        if (translated !== value) {
          el.setAttribute(attr, translated)
        }
      }
    }

    if (shouldSkipElement(el)) return

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
    let node: Node | null = walker.nextNode()
    while (node) {
      translateTextNode(node as Text, map)
      node = walker.nextNode()
    }
  }

  const processBatch = (map: TranslationMap) => {
    const batch = pendingMutations.splice(0)
    for (const mutation of batch) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateElement(node as Element, map)
          } else if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text, map)
          } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            node.childNodes.forEach((child) => {
              if (child.nodeType === Node.ELEMENT_NODE) {
                translateElement(child as Element, map)
              } else if (child.nodeType === Node.TEXT_NODE) {
                translateTextNode(child as Text, map)
              }
            })
          }
        })
      } else if (mutation.type === 'attributes') {
        if (mutation.target.nodeType === Node.ELEMENT_NODE) {
          translateElement(mutation.target as Element, map)
        }
      } else if (mutation.type === 'characterData') {
        if (mutation.target.nodeType === Node.TEXT_NODE) {
          translateTextNode(mutation.target as Text, map)
        }
      }
    }
  }

  const attributeFilter = [...TRANSLATABLE_ATTRIBUTES]

  return {
    start(sourceTree: unknown, targetTree: unknown) {
      if (!shouldRun()) return

      const map = applyRuntimeTranslationOverrides(
        buildLiteralTranslationMap(sourceTree, targetTree)
      )

      translateElement(document.body, map)

      observer = new MutationObserver((mutations) => {
        pendingMutations.push(...mutations)
        if (!processingQueued) {
          processingQueued = true
          requestAnimationFrame(() => {
            processingQueued = false
            processBatch(map)
          })
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter,
      })
    },

    stop() {
      observer?.disconnect()
      observer = null
      pendingMutations.length = 0
      processingQueued = false
    },
  }
}
