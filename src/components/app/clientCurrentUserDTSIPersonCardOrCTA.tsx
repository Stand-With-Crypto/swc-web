/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedLocale } from '@/intl/locales'
import { normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import {
  getYourPoliticianCategoryDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'

function DefaultPlacesSelect(props: Pick<GooglePlacesSelectProps, 'onChange' | 'value'>) {
  return (
    <div className="mx-auto max-w-md">
      <GooglePlacesSelect
        className="rounded-full bg-gray-100 text-gray-600"
        placeholder="Enter your address"
        {...props}
      />
    </div>
  )
}
export function ClientCurrentUserDTSIPersonCardOrCTA(props: { locale: SupportedLocale }) {
  return (
    <Suspense fallback={<DefaultPlacesSelect onChange={noop} value={null} />}>
      <_ClientCurrentUserDTSIPersonCardOrCTA {...props} />
    </Suspense>
  )
}

const POLITICIAN_CATEGORY: YourPoliticianCategory = 'senate-and-house'

function _ClientCurrentUserDTSIPersonCardOrCTA({ locale }: { locale: SupportedLocale }) {
  const { setAddress, address } = useMutableCurrentUserAddress()
  const res = useGetDTSIPeopleFromAddress(
    address === 'loading' ? '' : address?.description || '',
    POLITICIAN_CATEGORY,
  )
  if (!address || address === 'loading' || !res.data) {
    return (
      <DefaultPlacesSelect onChange={setAddress} value={address === 'loading' ? null : address} />
    )
  }
  if ('notFoundReason' in res.data) {
    return (
      <div>
        {formatGetDTSIPeopleFromAddressNotFoundReason(res.data)}{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          Try another address.
        </button>
      </div>
    )
  }
  const people = res.data.dtsiPeople
  const categoryDisplayName = getYourPoliticianCategoryDisplayName(POLITICIAN_CATEGORY)
  const stateCode = res.data.dtsiPeople.find(x => x.primaryRole?.primaryState)?.primaryRole
    ?.primaryState as USStateCode | undefined
  const districtRole = res.data.dtsiPeople.find(x => x.primaryRole?.primaryDistrict)?.primaryRole

  const urls = getIntlUrls(locale)
  return (
    <div>
      <p className="mb-3 text-center text-sm text-fontcolor-muted">
        Showing politicians for{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          {address.description}
        </button>
      </p>

      {stateCode && (
        <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center gap-4 rounded-3xl bg-muted p-6 sm:flex-row">
          <div>
            <h4 className="text-xl font-bold">Your crypto voter guide</h4>
            <p className="mt-4 text-fontcolor-muted">
              It looks like you’re in {US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]}. Take a look at
              our crypto voter guide for more key info on the role your state plays in crypto
              regulation.
            </p>
          </div>
          <div className="flex flex-col gap-4 max-sm:w-full md:flex-row">
            <Button asChild className="w-full">
              <InternalLink href={urls.locationStateSpecific(stateCode)}>
                {stateCode} voter guide
              </InternalLink>
            </Button>
            {districtRole && (
              <Button asChild className="w-full">
                <InternalLink
                  href={urls.locationDistrictSpecific({
                    stateCode,
                    district: normalizeDTSIDistrictId(districtRole),
                  })}
                >
                  District voter guide
                </InternalLink>
              </Button>
            )}
          </div>
        </div>
      )}
      <p className="mb-3 text-center text-xl font-bold">Your {categoryDisplayName}</p>
      <DTSIPersonHeroCardRow>
        {people.map(person => (
          <DTSIPersonHeroCard
            data-test-id="dtsi-person-associated-with-address"
            key={person.id}
            locale={locale}
            person={person}
            subheader="role"
          />
        ))}
      </DTSIPersonHeroCardRow>
    </div>
  )
}
