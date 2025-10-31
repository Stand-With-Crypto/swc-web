'use client'

import React, { Suspense, useEffect } from 'react'
import { UserActionType } from '@prisma/client'
import { notFound } from 'next/navigation'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormLetter } from '@/components/app/userActionFormLetter'
import { ANALYTICS_NAME_USER_ACTION_FORM_LETTER } from '@/components/app/userActionFormLetter/common/constants'
import { UserActionFormLetterSkeleton } from '@/components/app/userActionFormLetter/common/skeleton'
import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { cn } from '@/utils/web/cn'

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
    <LoginDialogWrapper
      authenticatedContent={
        <UserActionFormLetter {...props} initialValues={initialValues} user={user} />
      }
    >
      <div className={cn(dialogContentPaddingStyles)}>
        <ThirdwebLoginContent />
      </div>
    </LoginDialogWrapper>
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
