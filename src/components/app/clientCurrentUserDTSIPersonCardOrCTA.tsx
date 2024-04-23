/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedLocale } from '@/intl/locales'
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
          <div className="max-sm:w-full">
            <Button asChild className="max-sm:w-full">
              <InternalLink href={getIntlUrls(locale).locationStateSpecific(stateCode)}>
                View voter guide
              </InternalLink>
            </Button>
          </div>
        </div>
      )}
      <p className="mb-3 text-center text-xl font-bold">Your {categoryDisplayName}</p>
      <div className="mx-auto max-w-xl space-y-5">
        {people.map(person => (
          <DTSIPersonCard
            data-test-id="dtsi-person-associated-with-address"
            key={person.id}
            locale={locale}
            person={person}
            subheader="role"
            subheaderFormatter={str => `Your ${str}`}
          />
        ))}
      </div>
    </div>
  )
}
