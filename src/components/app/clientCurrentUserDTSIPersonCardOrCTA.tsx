/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedLocale } from '@/intl/locales'
import { getDTSIPersonRoleCategoryDisplayName } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'
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
  return (
    <div>
      <p className="mb-3 text-xl font-bold">Your {categoryDisplayName}</p>
      <p className="mb-3 text-sm text-fontcolor-muted">
        Showing politicians for{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          {address.description}
        </button>
      </p>
      <div className="space-y-5">
        {people.map(person => (
          <div
            className="mx-auto flex max-w-2xl flex-col justify-between gap-4 rounded-3xl bg-gray-100 p-5 text-left sm:flex-row sm:items-center sm:gap-10"
            key={person.id}
          >
            <div className="flex flex-row gap-4 text-sm sm:text-base lg:items-center">
              <div className="relative">
                <DTSIAvatar person={person} size={60} />
                <div className="absolute bottom-[5px] right-[-8px]">
                  <DTSIFormattedLetterGrade person={person} size={25} />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold">
                  {dtsiPersonFullName(person)}{' '}
                  {person.politicalAffiliationCategory
                    ? `(${dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                        person.politicalAffiliationCategory,
                      )})`
                    : ''}
                </div>
                {person.primaryRole && (
                  <div className="text-fontcolor-muted">
                    {getDTSIPersonRoleCategoryDisplayName(person.primaryRole)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Button asChild className="w-full">
                <InternalLink href={getIntlUrls(locale).politicianDetails(person.slug)}>
                  View profile
                </InternalLink>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
