'use client'

import dynamic from 'next/dynamic'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { Portal } from '@/components/ui/portal'
import { useDialog } from '@/hooks/useDialog'

const UserActionFormJoinSWCSuccessDialog = dynamic(
  () =>
    import('@/components/app/userActionFormJoinSWC/success').then(
      module => module.UserActionFormJoinSWCSuccessDialog,
    ),
  {
    loading: () => (
      <Portal>
        <div className="min-h-[400px]">
          <LoadingOverlay />
        </div>
      </Portal>
    ),
  },
)

interface UserActionFormJoinSWCDialogProps {
  children: React.ReactNode
}

const ANALYTICS_NAME_USER_ACTION_FORM_JOIN_SWC = 'User Action Form Join SWC'

/**
 * `UserActionFormJoinSWCDialog` is a component that opens a Success Dialog after a user joins SWC.
 *
 */
export function UserActionFormJoinSWCDialog(props: UserActionFormJoinSWCDialogProps) {
  const { children } = props

  const dialogProps = useDialog({
    initialOpen: false,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_JOIN_SWC,
  })

  return (
    <>
      <LoginDialogWrapper onLogin={() => dialogProps.onOpenChange(true)}>
        {children}
      </LoginDialogWrapper>

      <UserActionFormJoinSWCSuccessDialog defaultOpen={dialogProps.open} {...dialogProps} />
    </>
  )
}
