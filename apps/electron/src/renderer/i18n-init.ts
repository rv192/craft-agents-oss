import { initRendererI18n } from './i18n'

void initRendererI18n({ namespaces: ['common', 'settings', 'chat'] }).catch((error) => {
  console.error('Failed to initialize renderer i18n:', error)
})
