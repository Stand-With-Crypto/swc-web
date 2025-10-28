'use client'

import { UserActionType } from '@prisma/client'
import { notFound } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { LetterActionCampaignNames } from '@/components/app/userActionFormLetter/common/types'
import { UserActionFormLetterDeeplinkWrapper } from '@/components/app/userActionFormLetter/homepageDialogDeeplinkWrapper'
import { UserActionGridCampaignsDialogContent } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { useGridCTAs } from '@/components/app/userActionGridCTAs/hooks/useGridCTAs'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'

const actionName: UserActionType = UserActionType.LETTER

function UserActionFormLetterHomepageRootDialogDeeplinkContent({
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
        shouldOpenDeeplink={false}
        title={cta.title}
      />
    </div>
  )
}

export function UserActionLetterRootPageDeeplinkWrapper() {
  const countryCode = useCountryCode()

  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActionTypes = data?.performedUserActionTypes ?? []

  const { performedUserActionObj } = useGridCTAs({
    performedUserActionTypes,
  })

  const letterCta = getUserActionCTAsByCountry(countryCode)[actionName]

  if (!letterCta) {
    return notFound()
  }

  const activeCampaigns = letterCta.campaigns.filter(({ isCampaignActive }) => isCampaignActive)

  if (activeCampaigns.length === 0) {
    return notFound()
  }

  if (activeCampaigns.length === 1) {
    const campaign = activeCampaigns[0]

    return (
      <UserActionFormLetterDeeplinkWrapper
        campaignName={campaign.campaignName as LetterActionCampaignNames}
        countryCode={countryCode}
      />
    )
  }

  return (
    <GeoGate
      countryCode={countryCode}
      unavailableContent={<UserActionFormActionUnavailable countryCode={countryCode} />}
    >
      <UserActionFormLetterHomepageRootDialogDeeplinkContent
        cta={letterCta}
        performedUserActionObj={performedUserActionObj}
      />
    </GeoGate>
  )
}
