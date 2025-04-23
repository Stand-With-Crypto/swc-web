'use client'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionGridCampaignsDialogContent } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { useGridCTAs } from '@/components/app/userActionGridCTAs/hooks/useGridCTAs'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import type { UserActionType } from '@prisma/client'
import { Suspense } from 'react'

const actionName: UserActionType = 'VIEW_KEY_PAGE'

function UserActionFormViewKeyPageHomepageDialogDeeplinkContent({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActionTypes = data?.performedUserActionTypes ?? []

  const { performedUserActionObj } = useGridCTAs({
    performedUserActionTypes,
  })

  const cta = getUserActionCTAsByCountry(countryCode)[actionName]

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

export function UserActionViewKeyPageDeeplinkWrapper() {
  const countryCode = useCountryCode()
  return (
    <GeoGate
      countryCode={countryCode}
      unavailableContent={<UserActionFormActionUnavailable countryCode={countryCode} />}
    >
      <Suspense>
        <UserActionFormViewKeyPageHomepageDialogDeeplinkContent countryCode={countryCode} />
      </Suspense>
    </GeoGate>
  )
}
