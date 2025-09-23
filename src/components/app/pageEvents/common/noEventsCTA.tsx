'use client'

import Balancer from 'react-wrap-balancer'
import { SMSStatus } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { SMSOptInForm } from '@/components/app/sms/smsOptInForm'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      joinSWC: 'Join Stand With Crypto and we’ll keep you updated on any events in your area.',
      signIn: 'Sign in',
      enterYourNumber: 'Enter your number and we’ll keep you updated on any events in your area.',
      keepYouUpdated: 'We’ll keep you updated on any events in your area.',
      pleaseCheckBackLater: 'Please check back later for updates, as new events may be added soon.',
    },
    fr: {
      joinSWC:
        'Entrez votre numéro de téléphone et nous vous enverrons des mises à jour sur les événements dans votre région.',
      signIn: 'Se connecter',
      enterYourNumber:
        'Entrez votre numéro de téléphone et nous vous enverrons des mises à jour sur les événements dans votre région.',
      keepYouUpdated: 'Nous vous enverrons des mises à jour sur les événements dans votre région.',
      pleaseCheckBackLater:
        'Veuillez vérifier plus tard pour les mises à jour, car de nouveaux événements peuvent être ajoutés.',
    },
    de: {
      joinSWC:
        'Tragen Sie Ihre Telefonnummer ein und wir halten Sie über Ereignisse in Ihrer Region auf dem Laufenden.',
      signIn: 'Anmelden',
      enterYourNumber:
        'Tragen Sie Ihre Telefonnummer ein und wir halten Sie über Ereignisse in Ihrer Region auf dem Laufenden.',
      keepYouUpdated: 'Wir halten Sie über Ereignisse in Ihrer Region auf dem Laufenden.',
      pleaseCheckBackLater:
        'Bitte prüfen Sie später für Updates, da neue Ereignisse bald hinzugefügt werden.',
    },
  },
})

export function NoEventsCTA({
  initialText,
  className,
}: {
  initialText?: string
  className?: string
}) {
  const { t } = useTranslation(i18nMessages, 'noEventsCTA')

  const { data, isLoading, mutate } = useApiResponseForUserFullProfileInfo()
  const countryCode = useCountryCode()
  const user = data?.user

  return (
    <div className={cn('container flex flex-col items-center gap-4', className)}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <p className="text-center font-mono text-sm text-muted-foreground">
            <Balancer>
              {initialText}
              {user ? <CTATextBySMSStatus smsStatus={user.smsStatus} /> : t('joinSWC')}
            </Balancer>
          </p>
          {user ? (
            <>
              {user.smsStatus === SMSStatus.NOT_OPTED_IN &&
                isSmsSupportedInCountry(countryCode) && (
                  <SMSOptInForm
                    onSuccess={({ phoneNumber }) =>
                      void mutate({
                        user: {
                          ...data!.user!,
                          phoneNumber,
                        },
                      })
                    }
                    user={user}
                  >
                    {({ form }) => (
                      <div className="mt-4">
                        <div className="flex max-w-[400px] flex-col items-center gap-4">
                          <SMSOptInForm.PhoneNumberField className="w-full" />
                          <SMSOptInForm.Footnote className="w-full" />
                          <SMSOptInForm.SubmitButton
                            className="mt-4"
                            disabled={form.formState.isSubmitting}
                            variant="secondary"
                          />
                        </div>
                      </div>
                    )}
                  </SMSOptInForm>
                )}
            </>
          ) : (
            <LoginDialogWrapper>
              <Button variant="secondary">{t('signIn')}</Button>
            </LoginDialogWrapper>
          )}
        </>
      )}
    </div>
  )
}

function CTATextBySMSStatus({ smsStatus }: { smsStatus: SMSStatus }) {
  const countryCode = useCountryCode()
  const { t } = useTranslation(i18nMessages, 'CTATextBySMSStatus')

  if (isSmsSupportedInCountry(countryCode)) {
    if (smsStatus === SMSStatus.NOT_OPTED_IN) {
      return t('enterYourNumber')
    }

    if (
      [
        SMSStatus.OPTED_IN,
        SMSStatus.OPTED_IN_HAS_REPLIED,
        SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN,
      ].includes(smsStatus)
    ) {
      return t('keepYouUpdated')
    }
  }

  return t('pleaseCheckBackLater')
}
