'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { CommunicationsPreferenceForm } from '@/components/app/pageUserProfile/common/communicationsPreferenceForm'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmailUnsubscriptionStatus } from '@/hooks/useEmailUnsubscriptionStatus'
import {
  addToGlobalSuppressionGroup,
  removeFromGlobalSuppressionGroup,
} from '@/utils/server/sendgrid/marketing/suppresions'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { toastGenericError } from '@/utils/web/toastUtils'

const FORM_NAME = 'User Communication Preferences'

interface EmailSubscriptionFormProps {
  user: PageUserProfileUser
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      subscribed: 'Successfully subscribed to our emails!',
      unsubscribed: 'Successfully unsubscribed from our emails!',
      disclaimerText:
        "We'll send you emails about our campaigns, latest crypto policy news, your NFTs status, and more.",
      provideEmail: 'Please provide an email address to subscribe to our emails.',
    },
    fr: {
      subscribed: 'Abonnement à nos emails réussi !',
      unsubscribed: 'Désabonnement de nos emails réussi !',
      disclaimerText:
        'Nous vous enverrons des emails sur nos campagnes, les dernières nouvelles sur la politique crypto, le statut de vos NFT, et plus encore.',
      provideEmail: 'Veuillez fournir une adresse email pour vous abonner à nos emails.',
    },
    de: {
      subscribed: 'Erfolgreich für unsere E-Mails angemeldet!',
      unsubscribed: 'Erfolgreich von unseren E-Mails abgemeldet!',
      disclaimerText:
        'Wir senden Ihnen E-Mails über unsere Kampagnen, die neuesten Nachrichten zur Kryptopolitik, den Status Ihrer NFTs und mehr.',
      provideEmail:
        'Bitte geben Sie eine E-Mail-Adresse an, um sich für unsere E-Mails anzumelden.',
    },
  },
})

export function EmailSubscriptionForm({ user }: EmailSubscriptionFormProps) {
  const { t } = useTranslation(i18nMessages)

  const { primaryUserEmailAddress } = user
  const emailAddress = primaryUserEmailAddress?.emailAddress ?? ''

  const [isSubmitting, setIsSubmitting] = useState(false)
  const isFirstLoad = useRef(true)
  const { data: isUnsubscribed, mutate } = useEmailUnsubscriptionStatus(emailAddress, {
    onSuccess: () => {
      isFirstLoad.current = false
    },
    onError: () => {
      isFirstLoad.current = false
    },
    onLoadingSlow: () => {
      isFirstLoad.current = false
    },
  })

  const handleEmailOptInChange = async (emailOptIn: boolean) => {
    setIsSubmitting(true)
    const action = emailOptIn
      ? removeFromGlobalSuppressionGroup
      : async () => addToGlobalSuppressionGroup([emailAddress])

    const result = await triggerServerActionForForm(
      {
        formName: FORM_NAME,
        payload: emailAddress,
        onError: toastGenericError,
      },
      action,
    )

    if (result.status === 'success') {
      await mutate()
      toast.success(emailOptIn ? t('subscribed') : t('unsubscribed'))
    }

    setIsSubmitting(false)
  }

  const helpText = !emailAddress ? t('provideEmail') : ''

  const isEmailFieldDisabled = !emailAddress || isSubmitting || isFirstLoad.current

  return (
    <CommunicationsPreferenceForm.FormItem disclaimerText={t('disclaimerText')}>
      <CommunicationsPreferenceForm.CheckboxField
        checked={!isUnsubscribed}
        disabled={isEmailFieldDisabled}
        helpText={helpText}
        isLoading={isSubmitting || isFirstLoad.current}
        label="Email"
        onCheckedChange={handleEmailOptInChange}
      >
        {isFirstLoad.current ? <Skeleton className="h-4 w-4" /> : null}
      </CommunicationsPreferenceForm.CheckboxField>
    </CommunicationsPreferenceForm.FormItem>
  )
}
