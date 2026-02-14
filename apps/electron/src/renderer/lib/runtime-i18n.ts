type TranslationMap = Record<string, string>

export type RuntimeTranslationOverrides = {
  literal: TranslationMap
  substring: TranslationMap
}

type RuntimeI18nGuardInput = {
  enabled: boolean
  locale: string
  route: string
  whitelist: string[]
}

const TRANSLATABLE_ATTRIBUTES = ['title', 'placeholder', 'aria-label'] as const

let latestRuntimeLiteralOverrides: TranslationMap = {}

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
  if (!route) return true

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

function normalizeStringMap(value: unknown): TranslationMap {
  if (!value || typeof value !== 'object') return {}

  const next: TranslationMap = {}
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof key === 'string' && typeof entry === 'string') {
      next[key] = entry
    }
  }
  return next
}

function extractRuntimeFallbackMaps(localeTree: unknown): RuntimeTranslationOverrides {
  if (!localeTree || typeof localeTree !== 'object') {
    return { literal: {}, substring: {} }
  }

  const root = localeTree as Record<string, unknown>
  const common = root.common as Record<string, unknown> | undefined
  const directLiteral = normalizeStringMap(root.literal)
  const directSubstring = normalizeStringMap(root.substring)
  if (Object.keys(directLiteral).length > 0 || Object.keys(directSubstring).length > 0) {
    return {
      literal: directLiteral,
      substring: directSubstring,
    }
  }

  const runtimeFallback =
    (root.runtimeFallback as Record<string, unknown> | undefined)
    ?? (common?.runtimeFallback as Record<string, unknown> | undefined)

  return {
    literal: normalizeStringMap(runtimeFallback?.literalMap),
    substring: normalizeStringMap(runtimeFallback?.substringMap),
  }
}

export function buildRuntimeTranslationOverrides(
  sourceLocaleTree: unknown,
  targetLocaleTree: unknown,
): RuntimeTranslationOverrides {
  const source = extractRuntimeFallbackMaps(sourceLocaleTree)
  const target = extractRuntimeFallbackMaps(targetLocaleTree)

  return {
    literal: buildLiteralTranslationMap(source.literal, target.literal),
    substring: buildLiteralTranslationMap(source.substring, target.substring),
  }
}

function applySubstringOverrides(text: string, substringOverrides: TranslationMap): string {
  let next = text
  for (const [source, target] of Object.entries(substringOverrides)) {
    if (next.includes(source)) {
      next = next.replaceAll(source, target)
    }
  }
  return next
}

export function applyRuntimeTranslationOverrides(
  map: TranslationMap,
  overrides: Pick<RuntimeTranslationOverrides, 'literal'>,
): TranslationMap {
  const next = { ...map }

  for (const [source, target] of Object.entries(overrides.literal)) {
    next[normalizeText(source)] = target
  }

  return next
}

export function getRuntimeLiteralOverrides(): Record<string, string> {
  return { ...latestRuntimeLiteralOverrides }
}

export function createRuntimeI18nPilot(options?: {
  flag?: boolean
  whitelist?: string[]
  routeProvider?: () => string
  localeProvider?: () => string
}) {
  const enabledByFlag = options?.flag ?? false
  const whitelist = options?.whitelist ?? ['settings', 'allSessions']
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

  const translateTextNode = (node: Text, map: TranslationMap, substringOverrides: TranslationMap) => {
    const original = node.textContent ?? ''
    const trimmed = normalizeText(original)
    if (!trimmed) return
    const translated = map[trimmed]
    if (translated) {
      node.textContent = original.replace(trimmed, translated)
      return
    }

    const patched = applySubstringOverrides(original, substringOverrides)
    if (patched !== original) {
      node.textContent = patched
    }
  }

  const translateElement = (el: Element, map: TranslationMap, substringOverrides: TranslationMap) => {
    const translateElementAttributes = (target: Element) => {
      for (const attr of TRANSLATABLE_ATTRIBUTES) {
        const value = target.getAttribute(attr)
        if (value) {
          const translated = translateText(value, map)
          if (translated !== value) {
            target.setAttribute(attr, translated)
          }
        }
      }
    }

    translateElementAttributes(el)
    if (shouldSkipElement(el)) return

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null)
    let node: Node | null = walker.nextNode()
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        translateElementAttributes(node as Element)
      } else if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node as Text, map, substringOverrides)
      }
      node = walker.nextNode()
    }
  }

  const processBatch = (map: TranslationMap, substringOverrides: TranslationMap) => {
    const batch = pendingMutations.splice(0)
    for (const mutation of batch) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateElement(node as Element, map, substringOverrides)
          } else if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text, map, substringOverrides)
          } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            node.childNodes.forEach((child) => {
              if (child.nodeType === Node.ELEMENT_NODE) {
                translateElement(child as Element, map, substringOverrides)
              } else if (child.nodeType === Node.TEXT_NODE) {
                translateTextNode(child as Text, map, substringOverrides)
              }
            })
          }
        })
      } else if (mutation.type === 'attributes') {
        if (mutation.target.nodeType === Node.ELEMENT_NODE) {
          translateElement(mutation.target as Element, map, substringOverrides)
        }
      } else if (mutation.type === 'characterData') {
        if (mutation.target.nodeType === Node.TEXT_NODE) {
          translateTextNode(mutation.target as Text, map, substringOverrides)
        }
      }
    }
  }

  const attributeFilter = [...TRANSLATABLE_ATTRIBUTES]

  return {
    shouldRun,

    start(sourceTree: unknown, targetTree: unknown) {
      if (!shouldRun()) return

      const runtimeOverrides = buildRuntimeTranslationOverrides(sourceTree, targetTree)
      latestRuntimeLiteralOverrides = { ...runtimeOverrides.literal }

      const map = applyRuntimeTranslationOverrides(
        buildLiteralTranslationMap(sourceTree, targetTree),
        runtimeOverrides,
      )

      translateElement(document.body, map, runtimeOverrides.substring)

      observer = new MutationObserver((mutations) => {
        pendingMutations.push(...mutations)
        if (!processingQueued) {
          processingQueued = true
          requestAnimationFrame(() => {
            processingQueued = false
            processBatch(map, runtimeOverrides.substring)
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
