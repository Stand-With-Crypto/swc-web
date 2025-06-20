'use client'

import dynamic from 'next/dynamic'

import { UserActionFormJoinSWCSuccess } from '@/components/app/userActionFormJoinSWC'
import { UserActionFormSuccessScreenNextActionSkeleton } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useSession } from '@/hooks/useSession'
import { SWCSuccessDialogContext } from '@/hooks/useSuccessScreenDialogContext'
import { cn } from '@/utils/web/cn'

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

export function UserActionFormJoinSWCSuccessDialog(props: UserActionFormJoinSWCSuccessDialogProps) {
  const { ...dialogProps } = props

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
        <DialogContent a11yTitle="Joined Stand With Crypto" className="max-w-3xl">
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
