'use client'

import React, { Suspense, useEffect } from 'react'
import { UserActionType } from '@prisma/client'
import { notFound, useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormLetter } from '@/components/app/userActionFormLetter'
import { ANALYTICS_NAME_USER_ACTION_FORM_LETTER } from '@/components/app/userActionFormLetter/common/constants'
import { UserActionFormLetterSkeleton } from '@/components/app/userActionFormLetter/common/skeleton'
import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

interface UserActionFormLetterDeeplinkWrapperProps {
  countryCode: SupportedCountryCodes
  campaignName: AUUserActionLetterCampaignName
}

function UserActionFormLetterDeeplinkWrapperContent(
  props: UserActionFormLetterDeeplinkWrapperProps,
) {
  const { countryCode } = props
  usePreventOverscroll()

  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const urls = getIntlUrls(countryCode)
  const { user } = fetchUser.data || { user: null }
  const cta = getUserActionCTAsByCountry(countryCode)[UserActionType.LETTER]
  const campaign = cta.campaigns.find(campaign => campaign.campaignName === props.campaignName)

  const [initialValues, loadingParams] = useEncodedInitialValuesQueryParam({
    address: {
      description: '',
      place_id: '',
    },
    firstName: '',
    lastName: '',
  })

  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_LETTER })
  }, [])

  if (fetchUser.isLoading || loadingParams) {
    return (
      <UserActionFormLetterSkeleton campaignName={props.campaignName} countryCode={countryCode} />
    )
  }

  if (!campaign) {
    return notFound()
  }

  if (!campaign.isCampaignActive) {
    window.location.href = urls.home()
    return (
      <UserActionFormLetterSkeleton campaignName={props.campaignName} countryCode={countryCode} />
    )
  }

  return (
    <UserActionFormLetter
      {...props}
      initialValues={initialValues}
      onCancel={() => router.replace(urls.home())}
      user={user}
    />
  )
}

export function UserActionFormLetterDeeplinkWrapper(
  props: UserActionFormLetterDeeplinkWrapperProps,
) {
  const { countryCode, campaignName } = props

  return (
    <GeoGate
      countryCode={countryCode}
      unavailableContent={<UserActionFormActionUnavailable countryCode={countryCode} />}
    >
      <Suspense
        fallback={
          <UserActionFormLetterSkeleton campaignName={campaignName} countryCode={countryCode} />
        }
      >
        <UserActionFormLetterDeeplinkWrapperContent {...props} />
      </Suspense>
    </GeoGate>
  )
}
