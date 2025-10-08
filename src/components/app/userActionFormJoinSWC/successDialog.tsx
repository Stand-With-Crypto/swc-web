'use client'

import dynamic from 'next/dynamic'

import { UserActionFormJoinSWCSuccess } from '@/components/app/userActionFormJoinSWC'
import { UserActionFormSuccessScreenNextActionSkeleton } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useSession } from '@/hooks/useSession'
import { SWCSuccessDialogContext } from '@/hooks/useSuccessScreenDialogContext'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

const UserActionFormSuccessScreenNextAction = dynamic(
  () =>
    import(
      '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
    ).then(module => module.UserActionFormSuccessScreenNextAction),
  {
    loading: () => <UserActionFormSuccessScreenNextActionSkeleton />,
  },
)

type UserActionFormJoinSWCSuccessDialogProps = DialogProps

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      joinedStandWithCrypto: 'Joined Stand With Crypto',
    },
    fr: {
      joinedStandWithCrypto: 'Inscrit à Stand With Crypto',
    },
    de: {
      joinedStandWithCrypto: 'Stand With Crypto beigetreten',
    },
  },
})

export function UserActionFormJoinSWCSuccessDialog(props: UserActionFormJoinSWCSuccessDialogProps) {
  const { ...dialogProps } = props
  const { t } = useTranslation(i18nMessages, 'userActionFormJoinSWCSuccessDialog')

  const session = useSession()
  const performedUserActionTypesResponse = useApiResponseForUserPerformedUserActionTypes()
  const countryCode = useCountryCode()

  const performedUserActionTypes = performedUserActionTypesResponse.data?.performedUserActionTypes

  return (
    <SWCSuccessDialogContext.Provider
      value={{
        closeSuccessScreenDialogAfterNavigating: () => dialogProps?.onOpenChange?.(false),
      }}
    >
      <Dialog {...dialogProps}>
        <DialogContent a11yTitle={t('joinedStandWithCrypto')} className="max-w-3xl">
          <div className={cn('flex h-full flex-col gap-8 md:pb-16')}>
            <UserActionFormJoinSWCSuccess countryCode={countryCode} />

            {session.isLoading || !session.user || performedUserActionTypesResponse.isLoading ? (
              <UserActionFormSuccessScreenNextActionSkeleton />
            ) : (
              <UserActionFormSuccessScreenNextAction
                data={{
                  countryCode,
                  userHasEmbeddedWallet: session.user.hasEmbeddedWallet,
                  performedUserActionTypes: performedUserActionTypes || [],
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SWCSuccessDialogContext.Provider>
  )
}
