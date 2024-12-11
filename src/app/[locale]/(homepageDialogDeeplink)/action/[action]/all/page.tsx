'use client'
import { UserActionType } from '@prisma/client'
import { useParams } from 'next/navigation'

import { UserActionGridCampaignsDialogContent } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import { USER_ACTION_CTAS_FOR_GRID_DISPLAY } from '@/components/app/userActionGridCTAs/constants/ctas'
import { useGridCTAs } from '@/components/app/userActionGridCTAs/hooks/useGridCTAs'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

export default function UserActionCampaigns() {
  const params = useParams<{ action: UserActionType }>()
  const action = params?.action?.toUpperCase() ?? ''
  const cta = USER_ACTION_CTAS_FOR_GRID_DISPLAY[action]

  const { data, isLoading } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActionTypes = data?.performedUserActionTypes ?? []

  const { performedUserActionObj } = useGridCTAs({
    performedUserActionTypes,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <Skeleton className="h-14 w-44" />
        <Skeleton className="h-12 w-full" />

        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    )
  }

  return (
    <div className={dialogContentPaddingStyles}>
      <UserActionGridCampaignsDialogContent
        campaigns={cta.campaigns}
        description={cta.description}
        performedUserActions={performedUserActionObj}
        title={cta.title}
      />
    </div>
  )
}
