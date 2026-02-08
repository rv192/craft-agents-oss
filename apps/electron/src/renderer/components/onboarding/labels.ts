import type { TFunction } from 'i18next'

export function getWelcomeLabels(t: TFunction) {
  return {
    title: t('onboarding:welcome.title'),
    titleExisting: t('onboarding:welcome.titleExisting'),
    description: t('onboarding:welcome.description'),
    descriptionExisting: t('onboarding:welcome.descriptionExisting'),
    cta: t('onboarding:welcome.cta'),
    ctaExisting: t('onboarding:welcome.ctaExisting'),
    loading: t('onboarding:welcome.loading'),
  }
}

export function getReauthLabels(t: TFunction) {
  return {
    title: t('onboarding:reauth.title'),
    description: t('onboarding:reauth.description'),
    descriptionSecondary: t('onboarding:reauth.descriptionSecondary'),
    note: t('onboarding:reauth.note'),
    login: t('onboarding:reauth.login'),
    loggingIn: t('onboarding:reauth.loggingIn'),
    reset: t('onboarding:reauth.reset'),
    error: t('onboarding:reauth.error'),
  }
}
