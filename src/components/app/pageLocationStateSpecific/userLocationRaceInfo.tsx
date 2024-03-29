/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { compact, noop } from 'lodash-es'

import {
  LocationSpecificRaceInfo,
  LocationSpecificRaceInfoContainer,
} from '@/components/app/pageLocationStateSpecific/locationSpecificRaceInfo'
import { organizeStateSpecificPeople } from '@/components/app/pageLocationStateSpecific/organizeStateSpecificPeople'
import { uppercaseSectionHeader } from '@/components/ui/classUtils'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { formatGetCongressionalDistrictFromAddressNotFoundReason } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { pluralize } from '@/utils/shared/pluralize'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

type UserLocationRaceInfoProps = {
  groups: ReturnType<typeof organizeStateSpecificPeople>
  stateCode: USStateCode
}

function DefaultPlacesSelect(props: Pick<GooglePlacesSelectProps, 'onChange' | 'value'>) {
  return (
    <LocationSpecificRaceInfoContainer>
      <h3 className={cn(uppercaseSectionHeader, 'mb-3 text-primary-cta')}>Your District</h3>
      <div className="max-w-md">
        <GooglePlacesSelect
          className="rounded-full bg-gray-100 text-gray-600"
          placeholder="Enter your address"
          {...props}
        />
      </div>
    </LocationSpecificRaceInfoContainer>
  )
}

export function UserLocationRaceInfo(props: UserLocationRaceInfoProps) {
  return (
    <Suspense fallback={<DefaultPlacesSelect onChange={noop} value={null} />}>
      <_UserLocationRaceInfo {...props} />
    </Suspense>
  )
}

function _UserLocationRaceInfo({ groups, stateCode }: UserLocationRaceInfoProps) {
  const urls = useIntlUrls()
  const { setAddress, address } = useMutableCurrentUserAddress()
  const res = useGetDistrictFromAddress(address === 'loading' ? '' : address?.description || '', {
    stateCode,
  })
  if (!address || address === 'loading' || !res.data) {
    return (
      <DefaultPlacesSelect onChange={setAddress} value={address === 'loading' ? null : address} />
    )
  }
  if ('notFoundReason' in res.data) {
    return (
      <LocationSpecificRaceInfoContainer>
        <h3 className={cn(uppercaseSectionHeader, 'mb-3 text-primary-cta')}>Your District</h3>
        <div>
          {formatGetCongressionalDistrictFromAddressNotFoundReason(res.data)}{' '}
          <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
            Enter new address.
          </button>
        </div>
      </LocationSpecificRaceInfoContainer>
    )
  }
  const { districtNumber } = res.data
  const group = groups.runningFor.congresspeople[districtNumber]
  return (
    <LocationSpecificRaceInfo
      candidateSections={compact([
        group?.incumbents.length
          ? {
              title: pluralize({
                count: group?.incumbents.length,
                singular: 'Incumbent',
                plural: 'Incumbents',
              }),
              people: group?.incumbents,
            }
          : null,
        group?.candidates.length
          ? {
              title: pluralize({
                count: group?.candidates.length,
                singular: 'Candidate',
                plural: 'Candidates',
              }),
              people: group?.candidates,
            }
          : null,
      ])}
      subtitle={<span className="text-primary-cta">Your District</span>}
      title={<>Congressional District {districtNumber}</>}
      url={urls.locationDistrictSpecific({ stateCode, district: districtNumber })}
    >
      <p className="mb-3 text-sm text-fontcolor-muted">
        Showing district for{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          {address.description}
        </button>
      </p>
    </LocationSpecificRaceInfo>
  )
}
