/* eslint-disable @next/next/no-img-element */
'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { usePlacesAutocompleteAddress } from '@/hooks/usePlacesAutocompleteAddress'
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
import { getLocalUser, setLocalUserPersistedValues } from '@/utils/web/clientLocalUser'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

export function ClientCurrentUserDTSIPersonCardOrCTAWithQueryParam({
  locale,
}: {
  locale: SupportedLocale
}) {
  const searchParams = useSearchParams()
  const addressParam = searchParams?.get('address') ?? ''
  const { ready, addressSuggestions } = usePlacesAutocompleteAddress(
    decodeURIComponent(addressParam),
  )

  if (!ready && addressParam) {
    return <Skeleton className="h-[120px] w-full" />
  }

  return (
    <ClientCurrentUserDTSIPersonCardOrCTA
      initialAddress={
        addressSuggestions.length
          ? {
              description: addressSuggestions[0]?.description,
              place_id: addressSuggestions[0]?.place_id,
            }
          : undefined
      }
      locale={locale}
    />
  )
}

const POLITICIAN_CATEGORY: YourPoliticianCategory = 'senate-and-house'

export function ClientCurrentUserDTSIPersonCardOrCTA({
  locale,
  initialAddress,
}: {
  locale: SupportedLocale
  initialAddress?: GooglePlaceAutocompletePrediction
}) {
  const user = useApiResponseForUserFullProfileInfo()
  const hasHydrated = useHasHydrated()
  const userAddress = hasHydrated
    ? user.data?.user?.address || getLocalUser().persisted?.recentlyUsedAddress
    : null

  const formattedInitialAddress = useMemo(
    () =>
      initialAddress
        ? {
            place_id: initialAddress.place_id,
            description: initialAddress.description,
          }
        : null,
    [initialAddress],
  )

  const formattedUserAddress = userAddress
    ? {
        place_id: userAddress.googlePlaceId,
        description: userAddress.formattedDescription,
      }
    : null

  const [address, _setAddress] = useState<GooglePlaceAutocompletePrediction | null>(
    formattedInitialAddress || formattedUserAddress,
  )

  const setAddress = useCallback(
    (addr: GooglePlaceAutocompletePrediction | null) => {
      setLocalUserPersistedValues({
        recentlyUsedAddress: addr
          ? {
              googlePlaceId: addr.place_id,
              formattedDescription: addr.description,
            }
          : undefined,
      })
      _setAddress(addr)
    },
    [_setAddress],
  )
  const res = useGetDTSIPeopleFromAddress(address?.description || '', POLITICIAN_CATEGORY)

  // setting this as an auto-updating ref so that eslint doesn't complain
  // when we don't add address as a dependency to the useEffect below
  const addressRef = useRef(address)
  addressRef.current = address

  useEffect(() => {
    if (!addressRef.current && userAddress && !formattedInitialAddress) {
      _setAddress({
        place_id: userAddress.googlePlaceId,
        description: userAddress.formattedDescription,
      })
    }
  }, [formattedInitialAddress, userAddress])

  useEffect(() => {
    if (formattedInitialAddress) {
      _setAddress({
        place_id: formattedInitialAddress.place_id,
        description: formattedInitialAddress.description,
      })
    }
  }, [formattedInitialAddress])

  if (!address || !res.data) {
    return (
      <div className="mx-auto max-w-md">
        <GooglePlacesSelect
          className="rounded-full bg-gray-100 text-gray-600"
          onChange={setAddress}
          placeholder="Enter your address"
          value={address}
        />
      </div>
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
        Show politicians for{' '}
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
              <UserActionFormCallCongresspersonDialog>
                <Button className="w-full p-1">
                  <img alt="call button" src="/misc/call-icon.svg" />
                </Button>
              </UserActionFormCallCongresspersonDialog>
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
