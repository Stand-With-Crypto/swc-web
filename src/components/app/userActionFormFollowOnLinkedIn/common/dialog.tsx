'use client'

import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_FOLLOW_LINKEDIN } from '@/components/app/userActionFormFollowOnLinkedIn/common/constants'
import { UserActionFormFollowLinkedInSkeleton } from '@/components/app/userActionFormFollowOnLinkedIn/common/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const UserActionFormFollowLinkedIn = dynamic(
  () =>
    import('@/components/app/userActionFormFollowOnLinkedIn').then(
      mod => mod.UserActionFormFollowLinkedIn,
    ),
  {
    loading: () => <UserActionFormFollowLinkedInSkeleton />,
  },
)

interface UserActionFormFollowLinkedInDialogProps {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
  defaultOpen?: boolean
}

export function UserActionFormFollowLinkedInDialog(props: UserActionFormFollowLinkedInDialogProps) {
  const { children, countryCode, defaultOpen = false } = props

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_FOLLOW_LINKEDIN,
  })

  return (
    <UserActionFormDialog {...dialogProps} countryCode={countryCode} trigger={children}>
      <UserActionFormFollowLinkedIn
        countryCode={countryCode}
        onClose={() => dialogProps.onOpenChange(false)}
      />
    </UserActionFormDialog>
  )
}
