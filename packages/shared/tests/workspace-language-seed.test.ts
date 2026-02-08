import { describe, it, expect } from 'bun:test'
import { mkdirSync, rmSync, readFileSync } from 'fs'
import { join } from 'path'
import { createWorkspaceAtPath } from '../src/workspaces/storage'

describe('createWorkspaceAtPath', () => {
  it('seeds localized status and label configs when language is zh-CN', () => {
    const rootPath = join(process.cwd(), '.tmp-test-workspace-language-seed')

    rmSync(rootPath, { recursive: true, force: true })
    mkdirSync(rootPath, { recursive: true })

    // New workspace should use the app language as seed
    createWorkspaceAtPath(rootPath, 'Test Workspace', undefined, 'zh-CN')

    const statusConfig = JSON.parse(readFileSync(join(rootPath, 'statuses/config.json'), 'utf-8'))
    const labelConfig = JSON.parse(readFileSync(join(rootPath, 'labels/config.json'), 'utf-8'))

    expect(statusConfig.statuses.map((s: any) => s.label)).toEqual([
      '待办队列',
      '待处理',
      '需要复核',
      '已完成',
      '已取消',
    ])
    expect(labelConfig.labels.map((l: any) => l.name)).toEqual([
      '开发',
      '内容',
      '优先级',
      '项目',
    ])

    rmSync(rootPath, { recursive: true, force: true })
  })
})
