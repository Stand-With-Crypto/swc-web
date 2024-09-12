'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION } from '@/components/app/userActionFormVoterAttestation/constants'
import { FormFields } from '@/components/app/userActionFormVoterAttestation/types'
import { UserActionFormVotingInformationResearched } from '@/components/app/userActionFormVotingInformationResearched'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTING_INFORMATION_RESEARCHED,
  SectionsNames,
} from '@/components/app/userActionFormVotingInformationResearched/constants'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useSections } from '@/hooks/useSections'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { UserActionVotingInformationResearchedCampaignName } from '@/utils/shared/userActionCampaigns'

function UserActionFormVotingInformationDeeplinkWrapperContent() {
  usePreventOverscroll()

  const fetchUser = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const router = useRouter()
  const { user } = fetchUser.data || { user: null }
  const [initialValues, loadingParams] = useEncodedInitialValuesQueryParam<FormFields>({
    address: {
      description: '',
      place_id: '',
    },
  })

  const sectionProps = useSections({
    sections: Object.values(SectionsNames),
    initialSectionId: SectionsNames.ADDRESS,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTING_INFORMATION_RESEARCHED,
  })

  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION })
  }, [])

  return fetchUser.isLoading || loadingParams ? (
    <div className="min-h-[400px]">
      <LoadingOverlay />
    </div>
  ) : (
    <UserActionFormVotingInformationResearched
      {...sectionProps}
      initialValues={{
        address: user?.address
          ? {
              description: user.address.formattedDescription,
              place_id: user.address.googlePlaceId,
            }
          : initialValues?.address,
        campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
        shouldReceiveNotifications: false,
      }}
      onClose={() => router.push(urls.home())}
    />
  )
}

export function UserActionFormVotingInformationDeeplinkWrapper() {
  return (
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={<UserActionFormActionUnavailable />}
    >
      <Suspense
        fallback={
          <div className="min-h-[400px]">
            <LoadingOverlay />
          </div>
        }
      >
        <UserActionFormVotingInformationDeeplinkWrapperContent />
      </Suspense>
    </GeoGate>
  )
}
