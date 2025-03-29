'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormVoterAttestation } from '@/components/app/userActionFormVoterAttestation'
import { ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION } from '@/components/app/userActionFormVoterAttestation/constants'
import { UserActionFormVoterAttestationSkeleton } from '@/components/app/userActionFormVoterAttestation/skeleton'
import { FormFields } from '@/components/app/userActionFormVoterAttestation/types'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

function UserActionFormVoterAttestationDeeplinkWrapperContent() {
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
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION })
  }, [])

  return fetchUser.isLoading || loadingParams ? (
    <UserActionFormVoterAttestationSkeleton />
  ) : (
    <UserActionFormVoterAttestation
      initialValues={initialValues}
      onClose={() => router.push(urls.home())}
      user={user}
    />
  )
}

export function UserActionFormVoterAttestationDeeplinkWrapper() {
  return (
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={
        <UserActionFormActionUnavailable countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
      }
    >
      <Suspense fallback={<UserActionFormVoterAttestationSkeleton />}>
        <UserActionFormVoterAttestationDeeplinkWrapperContent />
      </Suspense>
    </GeoGate>
  )
}
