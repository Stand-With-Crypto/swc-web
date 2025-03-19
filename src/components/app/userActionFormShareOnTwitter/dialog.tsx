'use client'

import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { getUserActionTweetContentByCountry } from '@/components/app/userActionFormShareOnTwitter/common/getUserActionContentByCountry'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const UserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter/userActionFormShareOnTwitter').then(
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
  const countryConfig = getUserActionTweetContentByCountry(countryCode)

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: countryConfig.analyticsName,
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
