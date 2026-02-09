import { describe, expect, it } from 'bun:test'
import type { TFunction } from 'i18next'
import { getWorkspaceLabels } from '../workspace-settings-labels'
import { getSettingsNavigatorLabels } from '../settings-navigator-labels'
import { getLabelsSettingsLabels } from '../labels-settings-labels'

describe('settings page i18n labels', () => {
  it('returns localized workspace settings labels for empty and loading states', () => {
    const t: TFunction = ((key: string) => ({
      'settings:workspace.pageTitle': 'Workspace Settings Localized',
      'settings:workspace.emptyState': 'No workspace selected Localized',
      'settings:workspace.modeCycling.error': 'At least 2 modes required Localized',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getWorkspaceLabels(t)

    expect(labels.pageTitle).toBe('Workspace Settings Localized')
    expect(labels.emptyState).toBe('No workspace selected Localized')
    expect(labels.loadingTitle).toBe('Workspace Settings Localized')
    expect(labels.modeCyclingError).toBe('At least 2 modes required Localized')
  })

  it('returns localized settings navigator labels', () => {
    const t: TFunction = ((key: string) => ({
      'settings:navigator.openInNewWindow': 'Open in New Window Localized',
      'settings:navigator.items.workspace.label': 'Workspace Localized',
      'settings:navigator.items.workspace.description': 'Model and advanced Localized',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getSettingsNavigatorLabels(t)

    expect(labels.openInNewWindow).toBe('Open in New Window Localized')
    expect(labels.getItemLabel('workspace')).toBe('Workspace Localized')
    expect(labels.getItemDescription('workspace')).toBe('Model and advanced Localized')
  })

  it('returns localized labels settings labels', () => {
    const t: TFunction = ((key: string) => ({
      'settings:labels.pageTitle': 'Labels Localized',
      'settings:labels.about.title': 'About Labels Localized',
      'common:actions.editFile': 'Edit File Localized',
      'common:menu.learnMore': 'Learn More Localized',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getLabelsSettingsLabels(t)

    expect(labels.pageTitle).toBe('Labels Localized')
    expect(labels.aboutTitle).toBe('About Labels Localized')
    expect(labels.editFile).toBe('Edit File Localized')
    expect(labels.learnMore).toBe('Learn More Localized')
  })
})
