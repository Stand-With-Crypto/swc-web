'use client'

import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER } from '@/components/app/userActionFormShareOnTwitter/common/constants'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const UserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter').then(
      mod => mod.UserActionFormShareOnTwitter,
    ),
  {
    loading: () => (
      <div className="min-h-[400px]">
        <LoadingOverlay />
      </div>
    ),
  },
)

export function UserActionFormShareOnTwitterDialog({
  children,
  defaultOpen = false,
  countryCode,
}: {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  })

  return (
    <UserActionFormDialog {...dialogProps} trigger={children}>
      <UserActionFormShareOnTwitter
        countryCode={countryCode}
        onClose={() => dialogProps.onOpenChange(false)}
      />
    </UserActionFormDialog>
  )
}
