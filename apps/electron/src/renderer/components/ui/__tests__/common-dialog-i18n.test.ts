import { describe, expect, it } from 'bun:test'
import type { TFunction } from 'i18next'
import { getRenameDialogLabels } from '../rename-dialog'

describe('common dialog labels', () => {
  it('returns localized labels', () => {
    const t: TFunction = ((key: string) => ({
      'common:actions.cancel': '取消',
      'common:actions.save': '保存',
      'common:rename.title': '重命名',
      'common:rename.placeholder': '输入名称...',
    } as Record<string, string>)[key] || key) as TFunction

    const labels = getRenameDialogLabels(t)
    expect(labels.title).toBe('重命名')
    expect(labels.placeholder).toBe('输入名称...')
    expect(labels.cancel).toBe('取消')
    expect(labels.save).toBe('保存')
  })
})
