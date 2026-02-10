/**
 * CredentialsStep - Onboarding step wrapper for API key or OAuth flow
 *
 * Thin wrapper that composes ApiKeyInput or OAuthConnect controls
 * with StepFormLayout for the onboarding wizard context.
 */

import { ExternalLink } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { ApiSetupMethod } from "./APISetupStep"
import { StepFormLayout, BackButton, ContinueButton } from "./primitives"
import { getCredentialsLabels } from './labels'
import {
  ApiKeyInput,
  type ApiKeyStatus,
  type ApiKeySubmitData,
  OAuthConnect,
  type OAuthStatus,
} from "../apisetup"

export type CredentialStatus = ApiKeyStatus | OAuthStatus

interface CredentialsStepProps {
  apiSetupMethod: ApiSetupMethod
  status: CredentialStatus
  errorMessage?: string
  onSubmit: (data: ApiKeySubmitData) => void
  onStartOAuth?: () => void
  onBack: () => void
  // Two-step OAuth flow
  isWaitingForCode?: boolean
  onSubmitAuthCode?: (code: string) => void
  onCancelOAuth?: () => void
}

export function CredentialsStep({
  apiSetupMethod,
  status,
  errorMessage,
  onSubmit,
  onStartOAuth,
  onBack,
  isWaitingForCode,
  onSubmitAuthCode,
  onCancelOAuth,
}: CredentialsStepProps) {
  const { t } = useTranslation(['onboarding'])
  const labels = getCredentialsLabels(t)
  const isOAuth = apiSetupMethod === 'claude_oauth'

  // --- OAuth flow ---
  if (isOAuth) {
    // Waiting for authorization code entry
    if (isWaitingForCode) {
      return (
        <StepFormLayout
          title={t('onboarding:credentials.oauthCode.title')}
          description={t('onboarding:credentials.oauthCode.description')}
          actions={
            <>
              <BackButton onClick={onCancelOAuth} disabled={status === 'validating'}>
                {t('onboarding:credentials.oauthCode.cancel')}
              </BackButton>
              <ContinueButton
                type="submit"
                form="auth-code-form"
                disabled={false}
                loading={status === 'validating'}
                loadingText={t('onboarding:credentials.oauthCode.loading')}
              >
                {labels.continue}
              </ContinueButton>
            </>
          }
        >
          <OAuthConnect
            status={status as OAuthStatus}
            errorMessage={errorMessage}
            isWaitingForCode={true}
            onStartOAuth={onStartOAuth!}
            onSubmitAuthCode={onSubmitAuthCode}
            onCancelOAuth={onCancelOAuth}
          />
        </StepFormLayout>
      )
    }

    return (
      <StepFormLayout
        title={t('onboarding:credentials.oauthConnect.title')}
        description={t('onboarding:credentials.oauthConnect.description')}
          actions={
            <>
              <BackButton onClick={onBack} disabled={status === 'validating'}>{labels.back}</BackButton>
              <ContinueButton
                onClick={onStartOAuth}
                className="gap-2"
                loading={status === 'validating'}
              loadingText={t('onboarding:credentials.oauthConnect.loading')}
            >
              <ExternalLink className="size-4" />
              {t('onboarding:credentials.oauthConnect.button')}
            </ContinueButton>
          </>
        }
      >
        <OAuthConnect
          status={status as OAuthStatus}
          errorMessage={errorMessage}
          isWaitingForCode={false}
          onStartOAuth={onStartOAuth!}
          onSubmitAuthCode={onSubmitAuthCode}
          onCancelOAuth={onCancelOAuth}
        />
      </StepFormLayout>
    )
  }

  // --- API Key flow ---
  return (
    <StepFormLayout
      title={t('onboarding:credentials.apiKey.title')}
      description={t('onboarding:credentials.apiKey.description')}
      actions={
        <>
          <BackButton onClick={onBack} disabled={status === 'validating'}>{labels.back}</BackButton>
          <ContinueButton
            type="submit"
            form="api-key-form"
            disabled={false}
            loading={status === 'validating'}
            loadingText={t('onboarding:credentials.apiKey.loading')}
          >
            {labels.continue}
          </ContinueButton>
        </>
      }
    >
      <ApiKeyInput
        status={status as ApiKeyStatus}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
        customModelDefaultHint={labels.customModelDefaultHint}
        nonClaudeHint={labels.nonClaudeHint}
        modelFormatPrefix={labels.formatPrefix}
        browseModelsLabel={labels.browseModels}
        viewSupportedModelsLabel={labels.viewSupportedModels}
        ollamaHint={labels.ollamaHint}
        customModelLabel={labels.customModelLabel}
        optionalLabel={labels.optional}
        customPresetLabel={labels.customPreset}
      />
    </StepFormLayout>
  )
}
