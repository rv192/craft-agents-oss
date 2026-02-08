import type { TFunction } from 'i18next'

export interface SessionListLabels {
  today: string
  yesterday: string
  openInBrowser: string
  copyLink: string
  updateShare: string
  stopSharing: string
  linkCopied: string
  shareUpdated: string
  updateFailed: string
  shareStopped: string
  stopFailed: string
  noResultsInCurrentFilter: string
  inCurrentView: string
  otherConversations: string
  renameConversation: string
  renamePlaceholder: string
}

export function getSessionListLabels(t: TFunction): SessionListLabels {
  return {
    today: t('common:sessionList.date.today'),
    yesterday: t('common:sessionList.date.yesterday'),
    openInBrowser: t('common:sessionList.share.openInBrowser'),
    copyLink: t('common:sessionList.share.copyLink'),
    updateShare: t('common:sessionList.share.updateShare'),
    stopSharing: t('common:sessionList.share.stopSharing'),
    linkCopied: t('common:sessionList.share.linkCopied'),
    shareUpdated: t('common:sessionList.share.updated'),
    updateFailed: t('common:sessionList.share.updateFailed'),
    shareStopped: t('common:sessionList.share.stopped'),
    stopFailed: t('common:sessionList.share.stopFailed'),
    noResultsInCurrentFilter: t('common:sessionList.search.noResultsInCurrentFilter'),
    inCurrentView: t('common:sessionList.search.inCurrentView'),
    otherConversations: t('common:sessionList.search.otherConversations'),
    renameConversation: t('common:sessionList.rename.title'),
    renamePlaceholder: t('common:sessionList.rename.placeholder'),
  }
}
