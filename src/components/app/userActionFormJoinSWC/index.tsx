'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormJoinSWCSuccessDialog } from '@/components/app/userActionFormJoinSWC/successDialog'
import { useDialog } from '@/hooks/useDialog'

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
      <LoginDialogWrapper onLoginSuccess={() => dialogProps.onOpenChange(true)}>
        {children}
      </LoginDialogWrapper>

      <UserActionFormJoinSWCSuccessDialog defaultOpen={dialogProps.open} {...dialogProps} />
    </>
  )
}