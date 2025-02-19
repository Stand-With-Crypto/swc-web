'use client'

import { Suspense, useMemo } from 'react'
import { noop } from 'lodash-es'

import { ReferralLeaderboardRow } from '@/components/app/pageReferrals/referralLeaderboardRow'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useGetDistrictRank } from '@/hooks/useGetDistrictRank'
import { USStateCode } from '@/utils/shared/usStateUtils'

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
  const { setAddress, address } = useMutableCurrentUserAddress()

  const districtRankingResponse = useGetDistrictRank({
    stateCode,
    districtNumber,
  })

  if (districtRankingResponse.isLoading) {
    return (
      <DefaultPlacesSelect loading onChange={noop} value={address === 'loading' ? null : address} />
    )
  }

  const { data } = districtRankingResponse
  const count = data?.score ?? 0
  const rank = data?.rank

  if (!data) {
    return (
      <DefaultPlacesSelect
        loading={address === 'loading'}
        onChange={setAddress}
        value={address === 'loading' ? null : address}
      />
    )
  }

  return (
    <div className="space-y-3">
      <p className="pl-4 text-lg font-bold">Your district</p>
      <ReferralLeaderboardRow
        count={count}
        district={districtNumber ?? ''}
        rank={rank ?? 0}
        state={stateCode}
        variant="highlight"
      />
    </div>
  )
}

export function SuspenseYourDistrictRank() {
  const { setAddress, address } = useMutableCurrentUserAddress()
  const isLoading = address === 'loading'

  const districtResponse = useGetDistrictFromAddress(
    address && typeof address === 'object' && 'description' in address ? address.description : null,
  )

  const district = useMemo(() => {
    if (!districtResponse.data) return null
    return 'districtNumber' in districtResponse.data ? districtResponse.data : null
  }, [districtResponse.data])

  if (!address || isLoading) {
    return (
      <DefaultPlacesSelect
        loading={isLoading}
        onChange={setAddress}
        value={isLoading ? null : address}
      />
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
    <Suspense fallback={<DefaultPlacesSelect loading={true} onChange={noop} value={null} />}>
      <SuspenseYourDistrictRank />
    </Suspense>
  )
}
