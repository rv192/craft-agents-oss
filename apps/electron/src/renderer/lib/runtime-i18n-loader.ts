import { createRuntimeI18nPilot } from './runtime-i18n'

export type LocaleModuleMap = Record<string, { default: unknown }>

export function buildLocaleResources(
  localeModules: LocaleModuleMap,
  locale: 'en' | 'zh-CN',
  namespaceFiles: string[],
): Record<string, unknown> {
  const resources: Record<string, unknown> = {}

  for (const namespace of namespaceFiles) {
    const module = Object.entries(localeModules).find(([path]) => path.endsWith(`/locales/${locale}/${namespace}.json`))?.[1]
    if (module?.default) {
      resources[namespace] = module.default
    }
  }

  return resources
}

export async function bootstrapRuntimeI18nPilot(
  getAppLanguage: () => Promise<'system' | 'en' | 'zh-CN'>,
  pilotEnabled: boolean,
): Promise<void> {
  const appLanguage = await getAppLanguage()
  const pilot = createRuntimeI18nPilot({
    flag: pilotEnabled,
    whitelist: ['settings', 'allSessions', 'flagged', 'archived', 'state', 'label', 'view', 'sources', 'skills'],
    localeProvider: () => (appLanguage === 'system' ? navigator.language : appLanguage),
  })

  const localeModules = import.meta.glob('../../../../packages/shared/locales/{en,zh-CN}/*.json', {
    eager: true,
  }) as LocaleModuleMap

  const namespaceFiles = ['chat', 'common', 'dialogs', 'menu', 'onboarding', 'settings']
  const enResources = buildLocaleResources(localeModules, 'en', namespaceFiles)
  const zhResources = buildLocaleResources(localeModules, 'zh-CN', namespaceFiles)

  if (Object.keys(enResources).length === 0 || Object.keys(zhResources).length === 0) {
    return
  }

  pilot.start(enResources, zhResources)
}
