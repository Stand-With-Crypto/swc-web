'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { isNil, noop } from 'lodash-es'

import { DistrictsLeaderboardRow } from '@/components/app/pageReferrals/districtsLeaderboardRow'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useGetDistrictRank } from '@/hooks/useGetDistrictRank'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'

function Heading() {
  return (
    <div className="flex items-center justify-between">
      <p className="pl-4 text-lg font-bold">Your district</p>
      <p className="text-fontcolor-muted">Advocates</p>
    </div>
  )
}

function DefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <div className="w-full space-y-3">
      <p className="pl-4 text-lg font-bold">Your district</p>
      <GooglePlacesSelect
        className="rounded-full bg-gray-100 text-gray-600"
        placeholder="Enter your address"
        {...props}
      />
    </div>
  )
}

interface YourDistrictRankContentProps {
  stateCode: USStateCode
  districtNumber: string | null
}

function YourDistrictRankContent(props: YourDistrictRankContentProps) {
  const { stateCode, districtNumber } = props
  const countryCode = useCountryCode()
  const [isUSAddress, setIsUSAddress] = useState<boolean | 'loading'>(false)

  const { setAddress, address } = useMutableCurrentUserAddress()
  const isLoadingAddress = address === 'loading'

  const districtRankingResponse = useGetDistrictRank({
    stateCode,
    districtNumber,
  })

  const { data } = districtRankingResponse

  const checkIfUSAddress = useCallback(async () => {
    if (isLoadingAddress || !address || stateCode) return

    setIsUSAddress('loading')

    try {
      const addressDetails = await convertGooglePlaceAutoPredictionToAddressSchema(address)
      setIsUSAddress(addressDetails.countryCode.toLowerCase() === SupportedCountryCodes.US)
    } catch {
      setIsUSAddress(true)
    }
  }, [isLoadingAddress, address, stateCode])

  useEffect(() => {
    void checkIfUSAddress()
  }, [checkIfUSAddress])

  const isLoading = districtRankingResponse.isLoading || isUSAddress === 'loading'

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }

  if (!data) {
    const invalidAddressErrorMessage = isUSAddress
      ? 'District rank not found, please try a different address.'
      : "Looks like your address is outside the U.S., so it's not part of any district here."

    return (
      <div className="space-y-3">
        <DefaultPlacesSelect onChange={setAddress} value={isLoadingAddress ? null : address} />
        <p className="pl-4 text-sm text-fontcolor-muted">{invalidAddressErrorMessage}</p>
      </div>
    )
  }

  const count = data.score
  const rank = data.rank

  if (isNil(count) || isNil(rank)) {
    return null
  }

  return (
    <div className="space-y-3">
      <Heading />
      <DistrictsLeaderboardRow
        count={count}
        district={districtNumber ?? ''}
        locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
        rank={rank ?? 0}
        state={stateCode}
        variant="highlight"
      />
    </div>
  )
}

export function SuspenseYourDistrictRank() {
  const profileResponse = useApiResponseForUserFullProfileInfo()
  const { setAddress, address: mutableAddress } = useMutableCurrentUserAddress()
  const isLoadingAddress = profileResponse.isLoading || mutableAddress === 'loading'

  const address = useMemo(() => {
    if (isLoadingAddress) return null
    if (profileResponse.data?.user?.address) {
      return profileResponse.data.user.address.formattedDescription
    }
    if (mutableAddress) return mutableAddress.description
    return null
  }, [isLoadingAddress, mutableAddress, profileResponse.data?.user?.address])

  const districtResponse = useGetDistrictFromAddress(address)

  const district = useMemo(() => {
    if (!districtResponse.data) return null
    return 'districtNumber' in districtResponse.data ? districtResponse.data : null
  }, [districtResponse.data])

  if (!address || isLoadingAddress) {
    return (
      <DefaultPlacesSelect
        loading={isLoadingAddress}
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : mutableAddress}
      />
    )
  }

  if (districtResponse.isLoading) {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }
  return (
    <YourDistrictRankContent
      districtNumber={district?.districtNumber?.toString() ?? null}
      stateCode={district?.stateCode as USStateCode}
    />
  )
}

export function YourDistrictRank() {
  return (
    <Suspense fallback={<DefaultPlacesSelect loading onChange={noop} value={null} />}>
      <SuspenseYourDistrictRank />
    </Suspense>
  )
}
