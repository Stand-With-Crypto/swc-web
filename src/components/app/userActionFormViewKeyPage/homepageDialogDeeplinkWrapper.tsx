'use client'

import type { UserActionType } from '@prisma/client'

import { UserActionGridCampaignsDialogContent } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { useGridCTAs } from '@/components/app/userActionGridCTAs/hooks/useGridCTAs'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

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
  return <UserActionFormViewKeyPageHomepageDialogDeeplinkContent countryCode={countryCode} />
}
