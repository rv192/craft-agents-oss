import { describe, expect, it } from 'bun:test'
import type { TFunction } from 'i18next'
import { getActiveOptionBadgesLabels } from '../active-option-badges-labels'

describe('active option badges labels', () => {
  it('returns localized ultrathink label', () => {
    const t: TFunction = ((key: string) => ({
      'common:slashMenu.ultrathink.label': '深度思考',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getActiveOptionBadgesLabels(t)
    expect(labels.ultrathink).toBe('深度思考')
  })
})
