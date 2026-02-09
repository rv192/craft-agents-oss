import { describe, expect, it } from 'bun:test'
import type { TFunction } from 'i18next'
import { getAppShellLabels } from '../app-shell-labels'
import { getChatDisplayLabels } from '../chat-display-labels'

describe('app shell static i18n label helpers', () => {
  it('returns localized app-shell labels', () => {
    const t: TFunction = ((key: string) => ({
      'common:navigation.helpDocs': 'Help Localized',
      'common:filters.filterChats': 'Filter Chats Localized',
      'common:filters.searchPlaceholder': 'Search labels localized',
      'common:menu.addSource': 'Add Source Localized',
      'common:menu.addSkill': 'Add Skill Localized',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getAppShellLabels(t)

    expect(labels.helpDocs).toBe('Help Localized')
    expect(labels.filterChats).toBe('Filter Chats Localized')
    expect(labels.searchPlaceholder).toBe('Search labels localized')
    expect(labels.addSource).toBe('Add Source Localized')
    expect(labels.addSkill).toBe('Add Skill Localized')
  })

  it('returns localized compact chat empty-state labels', () => {
    const t: TFunction = ((key: string) => ({
      'common:chatDisplay.compactEmpty.title': 'Compact title localized',
      'common:chatDisplay.compactEmpty.description': 'Compact description localized',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getChatDisplayLabels(t)

    expect(labels.compactTitle).toBe('Compact title localized')
    expect(labels.compactDescription).toBe('Compact description localized')
  })
})
