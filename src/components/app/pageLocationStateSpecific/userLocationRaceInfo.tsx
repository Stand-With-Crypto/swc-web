/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { organizeStateSpecificPeople } from '@/components/app/pageLocationStateSpecific/organizeStateSpecificPeople'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { SupportedLocale } from '@/intl/locales'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { formatGetCongressionalDistrictFromAddressNotFoundReason } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

type UserLocationRaceInfoProps = {
  groups: ReturnType<typeof organizeStateSpecificPeople>
  stateCode: USStateCode
  locale: SupportedLocale
}

function DefaultPlacesSelect({
  stateCode,
  ...props
}: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'> & { stateCode: USStateCode }) {
  return (
    <div className="container mx-auto max-w-xl">
      <GooglePlacesSelect
        className="rounded-full bg-white text-gray-600"
        placeholder={`Enter a ${US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]} address`}
        {...props}
      />
    </div>
  )
}

export function UserLocationRaceInfo(props: UserLocationRaceInfoProps) {
  return (
    <Suspense
      fallback={<DefaultPlacesSelect onChange={noop} stateCode={props.stateCode} value={null} />}
    >
      <_UserLocationRaceInfo {...props} />
    </Suspense>
  )
}

function _UserLocationRaceInfo({ groups, stateCode, locale }: UserLocationRaceInfoProps) {
  const { setAddress, address } = useMutableCurrentUserAddress()
  const res = useGetDistrictFromAddress(address === 'loading' ? '' : address?.description || '', {
    stateCode,
  })
  if (!address || address === 'loading' || !res.data) {
    return (
      <DefaultPlacesSelect
        loading={address === 'loading'}
        onChange={setAddress}
        stateCode={stateCode}
        value={address === 'loading' ? null : address}
      />
    )
  }
  if ('notFoundReason' in res.data) {
    return (
      <div className="container text-center text-fontcolor-muted">
        {formatGetCongressionalDistrictFromAddressNotFoundReason(res.data)}{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          Enter new address.
        </button>
      </div>
    )
  }
  const { districtNumber } = res.data
  const group = groups.congresspeople[districtNumber]
  const { recommended, others } = findRecommendedCandidate(group.people)
  const urls = getIntlUrls(locale)
  return (
    <div>
      <p className="container mb-3 text-center text-sm text-fontcolor-muted">
        Showing district for{' '}
        <button className="text-primary-cta" onClick={() => setAddress(null)}>
          {address.description}
        </button>
      </p>
      <DTSIPersonHeroCardRow>
        {recommended && (
          <DTSIPersonHeroCard isRecommended locale={locale} person={recommended} subheader="role" />
        )}
        {others.map(person => (
          <DTSIPersonHeroCard
            key={person.id}
            locale={locale}
            person={person}
            subheader={person.isIncumbent ? 'Incumbent' : 'role'}
          />
        ))}
      </DTSIPersonHeroCardRow>
      <div className="container mt-8 text-center xl:mt-14">
        <Button asChild className="max-sm:w-full">
          <InternalLink
            href={urls.locationDistrictSpecific({ stateCode, district: districtNumber })}
          >
            View Race
          </InternalLink>
        </Button>
      </div>
    </div>
  )
}
