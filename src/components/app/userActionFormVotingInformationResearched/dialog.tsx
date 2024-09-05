'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormVotingInformationResearchedProps } from '@/components/app/userActionFormVotingInformationResearched'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useDialog } from '@/hooks/useDialog'
import { useSession } from '@/hooks/useSession'
import { UserActionVotingInformationResearchedCampaignName } from '@/utils/shared/userActionCampaigns'

import { FORM_NAME } from './formConfig'

const UserActionFormVotingInformationResearched = dynamic(
  () =>
    import('@/components/app/userActionFormVotingInformationResearched').then(
      mod => mod.UserActionFormVotingInformationResearched,
    ),
  {
    loading: () => (
      <div className="min-h-[400px]">
        <LoadingOverlay />
      </div>
    ),
  },
)

interface UserActionFormVotingInformationResearchedDialog
  extends Partial<UserActionFormVotingInformationResearchedProps> {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function UserActionFormVotingInformationResearchedDialog({
  children,
  defaultOpen = false,
  ...formProps
}: UserActionFormVotingInformationResearchedDialog) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: FORM_NAME,
  })

  const { user, isLoading } = useSession()

  return (
    <Suspense fallback={children}>
      <UserActionFormDialog {...dialogProps} trigger={children}>
        {isLoading ? (
          <div className="min-h-[400px]">
            <LoadingOverlay />
          </div>
        ) : (
          <UserActionFormVotingInformationResearched
            {...formProps}
            initialValues={{
              address: user?.address
                ? {
                    description: user?.address?.formattedDescription,
                    place_id: user?.address?.googlePlaceId,
                  }
                : undefined,
              shouldReceiveNotifications: false,
              campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
              ...formProps.initialValues,
            }}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        )}
      </UserActionFormDialog>
    </Suspense>
  )
}
