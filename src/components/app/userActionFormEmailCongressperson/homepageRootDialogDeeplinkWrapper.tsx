'use client'

import { UserActionType } from '@prisma/client'
import { notFound } from 'next/navigation'

import { EmailActionCampaignNames } from '@/components/app/userActionFormEmailCongressperson/common/types'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { UserActionGridCampaignsDialogContent } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { useGridCTAs } from '@/components/app/userActionGridCTAs/hooks/useGridCTAs'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'

const actionName: UserActionType = 'EMAIL'

function UserActionFormEmailCongresspersonHomepageRootDialogDeeplinkContent({
  cta,
  performedUserActionObj,
}: {
  cta: ReturnType<typeof getUserActionCTAsByCountry>[typeof actionName]
  performedUserActionObj: ReturnType<typeof useGridCTAs>['performedUserActionObj']
}) {
  return (
    <div className={dialogContentPaddingStyles}>
      <UserActionGridCampaignsDialogContent
        campaigns={cta.campaigns}
        description={cta.description}
        performedUserActions={performedUserActionObj}
        shouldOpenDeeplink={true}
        title={cta.title}
      />
    </div>
  )
}

export function UserActionEmailCongresspersonRootPageDeeplinkWrapper() {
  const countryCode = useCountryCode()

  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActionTypes = data?.performedUserActionTypes ?? []

  const { performedUserActionObj } = useGridCTAs({
    performedUserActionTypes,
  })

  const pageCta = getUserActionCTAsByCountry(countryCode)[actionName]

  if (!pageCta) {
    return notFound()
  }

  if (pageCta.campaigns.length === 1) {
    const campaign = pageCta.campaigns[0]

    return (
      <UserActionFormEmailCongresspersonDeeplinkWrapper
        campaignName={campaign.campaignName as EmailActionCampaignNames}
        countryCode={countryCode}
      />
    )
  }

  return (
    <UserActionFormEmailCongresspersonHomepageRootDialogDeeplinkContent
      cta={pageCta}
      performedUserActionObj={performedUserActionObj}
    />
  )
}
