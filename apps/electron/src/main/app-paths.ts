import { app } from 'electron'
import { join } from 'path'

/**
 * Resolve the app base path safely for packaged and dev contexts.
 * Falls back to process.resourcesPath/app or process.cwd() when app path is unavailable.
 */
export function getAppBasePath(): string {
  const appPath = app?.getAppPath?.()
  if (appPath) return appPath
  if (process.resourcesPath) return join(process.resourcesPath, 'app')
  return process.cwd()
}
