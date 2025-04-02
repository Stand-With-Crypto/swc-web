/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { ContentSection } from '@/components/app/ContentSection'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { organizeStateSpecificPeople } from '@/components/app/pageLocationKeyRaces/us/locationStateSpecific/organizeStateSpecificPeople'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { formatGetCongressionalDistrictFromAddressNotFoundReason } from '@/utils/shared/getCongressionalDistrictFromAddress'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

type UserLocationRaceInfoProps = {
  groups: ReturnType<typeof organizeStateSpecificPeople>
  stateCode: USStateCode
  stateName: string
}

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

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
      fallback={
        <ContentContainer shouldShowSubtitle={true} stateName={props.stateName}>
          <DefaultPlacesSelect onChange={noop} stateCode={props.stateCode} value={null} />
        </ContentContainer>
      }
    >
      <SuspenseUserLocationRaceInfo {...props} />
    </Suspense>
  )
}

function SuspenseUserLocationRaceInfo({ groups, stateCode, stateName }: UserLocationRaceInfoProps) {
  const { setAddress, address } = useMutableCurrentUserAddress()
  const res = useGetDistrictFromAddress(address === 'loading' ? null : address?.description, {
    stateCode,
  })
  const shouldShowSubtitle = !address || !res.data

  if (!address || address === 'loading' || !res.data) {
    return (
      <ContentContainer shouldShowSubtitle={shouldShowSubtitle} stateName={stateName}>
        <DefaultPlacesSelect
          loading={address === 'loading' || res.isLoading}
          onChange={setAddress}
          stateCode={stateCode}
          value={address === 'loading' ? null : address}
        />
      </ContentContainer>
    )
  }
  if ('notFoundReason' in res.data) {
    return (
      <ContentContainer shouldShowSubtitle={shouldShowSubtitle} stateName={stateName}>
        <div className="container text-center text-fontcolor-muted">
          {formatGetCongressionalDistrictFromAddressNotFoundReason(res.data)}{' '}
          <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
            Enter new address.
          </button>
        </div>
      </ContentContainer>
    )
  }
  const { districtNumber } = res.data

  const group = groups.congresspeople[districtNumber]
  const { recommended, others } = findRecommendedCandidate(group.people)
  const urls = getIntlUrls(countryCode)

  return (
    <ContentContainer shouldShowSubtitle={shouldShowSubtitle} stateName={stateName}>
      <div>
        <p className="container mb-3 text-center text-sm text-fontcolor-muted">
          Showing district for{' '}
          <button className="text-primary-cta" onClick={() => setAddress(null)}>
            {address.description}
          </button>
        </p>
        <DTSIPersonHeroCardRow>
          {recommended && (
            <DTSIPersonHeroCard
              countryCode={countryCode}
              cryptoStanceGrade={DTSIFormattedLetterGrade}
              isRecommended
              person={recommended}
              subheader="role"
            />
          )}
          {others.map(person => (
            <DTSIPersonHeroCard
              countryCode={countryCode}
              cryptoStanceGrade={DTSIFormattedLetterGrade}
              key={person.id}
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
    </ContentContainer>
  )
}

function ContentContainer({
  stateName,
  children,
  shouldShowSubtitle,
}: React.PropsWithChildren<{ shouldShowSubtitle: boolean }> &
  Pick<UserLocationRaceInfoProps, 'stateName'>) {
  return (
    <ContentSection
      className="bg-muted py-14"
      subtitle={
        shouldShowSubtitle ? (
          <>
            Do you live in {stateName}? Enter your address and we’ll redirect you to races in your
            district.
          </>
        ) : null
      }
      title={'Your district'}
    >
      {children}
    </ContentSection>
  )
}
