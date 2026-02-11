import { describe, expect, it } from 'bun:test'

import { getAssetCopyPairs } from '../copy-assets'

describe('getAssetCopyPairs', () => {
  it('includes shared locales copy target for packaged main-process i18n', () => {
    const pairs = getAssetCopyPairs('/repo')

    expect(pairs).toContainEqual({
      source: '/repo/packages/shared/locales',
      destination: '/repo/apps/electron/dist/resources/locales',
    })
  })
})
