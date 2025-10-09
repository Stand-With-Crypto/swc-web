'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  actionUpdateUserHasOptedInToSMS,
  UpdateUserHasOptedInToSMSPayload,
} from '@/actions/actionUpdateUserHasOptedInSMS'
import { CommunicationsPreferenceForm } from '@/components/app/pageUserProfile/common/communicationsPreferenceForm'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { SMSOptInConsentText } from '@/components/app/sms/smsOptInConsentText'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { userHasOptedInToSMS } from '@/utils/shared/sms/userHasOptedInToSMS'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { toastGenericError } from '@/utils/web/toastUtils'

const FORM_NAME = 'User Communication Preferences'

interface SMSSubscriptionFormProps {
  user: PageUserProfileUser
  countryCode: SupportedCountryCodes
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      subscribed: 'Successfully subscribed to our text messages!',
      unsubscribed: 'Successfully unsubscribed from our text messages!',
      providePhoneNumber: 'Please provide a phone number to subscribe to our text messages.',
      optOutText: 'To opt-out at any time reply "STOP".',
    },
    fr: {
      subscribed: 'Abonnement à nos messages texte réussi !',
      unsubscribed: 'Désabonnement de nos messages texte réussi !',
      providePhoneNumber:
        'Veuillez fournir un numéro de téléphone pour vous abonner à nos messages texte.',
      optOutText: 'Pour vous désabonner à tout moment, répondez "STOP".',
    },
    de: {
      subscribed: 'Erfolgreich für unsere Textnachrichten angemeldet!',
      unsubscribed: 'Erfolgreich von unseren Textnachrichten abgemeldet!',
      providePhoneNumber:
        'Bitte geben Sie eine Telefonnummer an, um sich für unsere Textnachrichten anzumelden.',
      optOutText: 'Um sich jederzeit abzumelden, antworten Sie mit "STOP".',
    },
  },
})

export function SMSSubscriptionForm({ user, countryCode }: SMSSubscriptionFormProps) {
  const { t } = useTranslation(i18nMessages)

  const { phoneNumber } = user

  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasOptedInToSMS = userHasOptedInToSMS(user)

  const handleSMSOptInChange = async (optedInToSms: boolean) => {
    setIsSubmitting(true)

    const payload: UpdateUserHasOptedInToSMSPayload = {
      phoneNumber,
      optedInToSms,
    }
    const result = await triggerServerActionForForm(
      {
        formName: FORM_NAME,
        onError: toastGenericError,
        payload,
      },
      actionUpdateUserHasOptedInToSMS,
    )

    if (result.status === 'success') {
      toast.success(optedInToSms ? t('subscribed') : t('unsubscribed'))
    }

    setIsSubmitting(false)
  }

  const helpText = useMemo(() => {
    if (!phoneNumber) {
      return t('providePhoneNumber')
    }
    if (hasOptedInToSMS) {
      return t('optOutText')
    }
    return ''
  }, [phoneNumber, hasOptedInToSMS, t])

  const isSMSFieldDisabled = !phoneNumber || isSubmitting || hasOptedInToSMS

  return (
    <CommunicationsPreferenceForm.FormItem disclaimerText={SMSOptInConsentText({ countryCode })}>
      <CommunicationsPreferenceForm.CheckboxField
        checked={hasOptedInToSMS}
        disabled={isSMSFieldDisabled}
        helpText={helpText}
        isLoading={isSubmitting}
        label="SMS"
        onCheckedChange={handleSMSOptInChange}
      />
    </CommunicationsPreferenceForm.FormItem>
  )
}
