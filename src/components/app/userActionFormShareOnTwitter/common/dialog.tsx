'use client'

import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER } from '@/components/app/userActionFormShareOnTwitter/common/constants'
import { UserActionFormShareOnTwitterSkeleton } from '@/components/app/userActionFormShareOnTwitter/common/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const UserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter').then(
      mod => mod.UserActionFormShareOnTwitter,
    ),
  {
    loading: () => <UserActionFormShareOnTwitterSkeleton />,
  },
)

interface UserActionFormShareOnTwitterDialogProps {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
  defaultOpen?: boolean
}

export function UserActionFormShareOnTwitterDialog(props: UserActionFormShareOnTwitterDialogProps) {
  const { children, countryCode, defaultOpen = false } = props

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  })

  return (
    <UserActionFormDialog {...dialogProps} countryCode={countryCode} trigger={children}>
      <UserActionFormShareOnTwitter
        countryCode={countryCode}
        onClose={() => dialogProps.onOpenChange(false)}
      />
    </UserActionFormDialog>
  )
}
