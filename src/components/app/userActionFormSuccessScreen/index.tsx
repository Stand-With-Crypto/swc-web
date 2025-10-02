'use client'

import { SMSStatus } from '@prisma/client'
import { noop } from 'lodash-es'
import { useSWRConfig } from 'swr'

import { SMSOptInForm } from '@/components/app/sms/smsOptInForm'
import { JoinSWC } from '@/components/app/userActionFormSuccessScreen/joinSWC'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import {
  UserActionFormSuccessScreenNextAction,
  UserActionFormSuccessScreenNextActionSkeleton,
} from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import { useSession } from '@/hooks/useSession'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface UserActionFormSuccessScreenProps {
  children: React.ReactNode
  onClose: () => void
  onLoad?: () => void
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Nice work!',
      description:
        'This is an important time for crypto. Sign up for occasional text updates on important legislation, elections, and events in your area.',
    },
    de: {
      title: 'Gute Arbeit!',
      description:
        'Dies ist eine wichtige Zeit für Krypto. Melden Sie sich für regelmäßige Textnachrichten auf wichtige Gesetze, Wahlen und Ereignisse in Ihrer Region an.',
    },
    fr: {
      title: 'Bon travail!',
      description:
        "C'est un moment important pour le crypto. Inscrivez-vous pour des mises à jour textuelles occasionnelles sur les lois importantes, les élections et les événements dans votre région.",
    },
  },
})

export function UserActionFormSuccessScreen(props: UserActionFormSuccessScreenProps) {
  const { t } = useTranslation(i18nMessages, 'UserActionFormSuccessScreen')
  const { children, onClose } = props

  const countryCode = useCountryCode()

  const { user, isLoggedIn, isLoading } = useSession()
  const performedActionsResponse = useApiResponseForUserPerformedUserActionTypes({
    revalidateOnMount: true,
  })
  const { mutate } = useSWRConfig()

  useEffectOnce(props.onLoad ?? noop)

  useEffectOnce(() => {
    // This revalidation is used to revalidate the user's completed actions list
    // after they complete any action
    void mutate(apiUrls.userFullProfileInfo())
    void mutate(apiUrls.userPerformedUserActionTypes({ countryCode }))
  })

  if (!isLoggedIn || !user) {
    return <JoinSWC onClose={onClose} />
  }

  if (
    (!user.phoneNumber || user.smsStatus === SMSStatus.NOT_OPTED_IN) &&
    isSmsSupportedInCountry(countryCode)
  ) {
    if (isLoading) {
      return (
        <div className="space-y-8">
          <UserActionFormSuccessScreenFeedback.Skeleton />

          <Skeleton className="mx-auto h-14 w-full max-w-[450px]" />
        </div>
      )
    }

    return (
      <div className="mx-auto flex h-full max-w-lg flex-col items-center gap-6 text-center">
        <UserActionFormSuccessScreenFeedback description={t('description')} title={t('title')} />

        <SMSOptInForm
          className="h-full"
          onSuccess={({ phoneNumber }) => {
            void mutate(apiUrls.userFullProfileInfo(), {
              ...user,
              phoneNumber,
            })
            void performedActionsResponse.mutate()
          }}
          user={user}
        >
          {({ form }) => (
            <div className="flex h-full flex-col gap-2">
              <SMSOptInForm.PhoneNumberField shouldAutoFocus />

              <div className="mt-auto">
                <SMSOptInForm.Footnote className="mb-8" />
                <SMSOptInForm.SubmitButton
                  className="w-full md:max-w-[300px]"
                  disabled={form.formState.isSubmitting}
                  size="lg"
                />
              </div>
            </div>
          )}
        </SMSOptInForm>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full flex-col gap-8 md:pb-12')}>
      {children}

      {isLoading || performedActionsResponse.isLoading ? (
        <UserActionFormSuccessScreenNextActionSkeleton />
      ) : (
        <UserActionFormSuccessScreenNextAction
          data={{
            countryCode,
            userHasEmbeddedWallet: user.hasEmbeddedWallet,
            performedUserActionTypes: performedActionsResponse.data?.performedUserActionTypes || [],
          }}
        />
      )}
    </div>
  )
}
