import { describe, it, expect } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('permissions config localized defaults sync', () => {
  it('installs default.zh-CN.json when bundled localized asset exists', async () => {
    const root = mkdtempSync(join(tmpdir(), 'craft-permissions-sync-'))

    try {
      const configDir = join(root, '.craft-agent')
      const bundledRoot = join(root, 'bundled')
      const bundledPermissionsDir = join(bundledRoot, 'resources', 'permissions')

      mkdirSync(configDir, { recursive: true })
      mkdirSync(bundledPermissionsDir, { recursive: true })

      const defaultJson = JSON.stringify({ version: '2026-02-07', allowedBashPatterns: [] }, null, 2)
      const localizedJson = JSON.stringify({ version: '2026-02-07', allowedBashPatterns: [{ pattern: '^ls\\b', comment: '列出目录内容' }] }, null, 2)

      writeFileSync(join(bundledPermissionsDir, 'default.json'), defaultJson, 'utf-8')
      writeFileSync(join(bundledPermissionsDir, 'default.zh-CN.json'), localizedJson, 'utf-8')

      process.env.CRAFT_CONFIG_DIR = configDir
      const pathsMod = await import('../../utils/paths.ts')
      pathsMod.setBundledAssetsRoot(bundledRoot)

      const modPath = join(import.meta.dir, '..', 'permissions-config.ts')
      const mod = await import(`${modPath}?t=${Date.now()}`)
      mod.ensureDefaultPermissions()

      const localizedDestPath = join(configDir, 'permissions', 'default.zh-CN.json')
      expect(existsSync(localizedDestPath)).toBe(true)
    } finally {
      delete process.env.CRAFT_CONFIG_DIR
      rmSync(root, { recursive: true, force: true })
    }
  })
})
