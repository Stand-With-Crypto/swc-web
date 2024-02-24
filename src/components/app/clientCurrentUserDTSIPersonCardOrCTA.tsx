'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { SupportedLocale } from '@/intl/locales'
import { getDTSIFormattedShortPersonRole } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { getLocalUser, setLocalUserPersistedValues } from '@/utils/web/clientLocalUser'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

export function ClientCurrentUserDTSIPersonCardOrCTA({ locale }: { locale: SupportedLocale }) {
  const user = useApiResponseForUserFullProfileInfo()
  const hasHydrated = useHasHydrated()
  const userAddress = hasHydrated
    ? user.data?.user?.address || getLocalUser().persisted?.recentlyUsedAddress
    : null
  const [address, _setAddress] = useState<GooglePlaceAutocompletePrediction | null>(
    userAddress
      ? {
          place_id: userAddress.googlePlaceId,
          description: userAddress.formattedDescription,
        }
      : null,
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
  const res = useGetDTSIPeopleFromAddress(address?.description || '')

  // setting this as an auto-updating ref so that eslint doesn't complain
  // when we don't add address as a dependency to the useEffect below
  const addressRef = useRef(address)
  addressRef.current = address

  useEffect(() => {
    if (!addressRef.current && userAddress) {
      _setAddress({
        place_id: userAddress.googlePlaceId,
        description: userAddress.formattedDescription,
      })
    }
  }, [userAddress])

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
  const person = res.data
  return (
    <div>
      <p className="mb-3 text-xl font-bold">Your representative</p>
      <p className="mb-3 text-sm text-fontcolor-muted">
        Show representative for{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          {address.description}
        </button>
      </p>
      <div className="mx-auto flex max-w-2xl flex-col justify-between gap-4 rounded-3xl bg-gray-100 p-5 text-left sm:flex-row sm:items-center sm:gap-10">
        <div className="flex flex-row items-center gap-4 text-sm sm:text-base">
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
                {getDTSIFormattedShortPersonRole(person.primaryRole)}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <UserActionFormCallCongresspersonDialog>
            <Button>Call</Button>
          </UserActionFormCallCongresspersonDialog>
          <Button asChild>
            <InternalLink href={getIntlUrls(locale).politicianDetails(person.slug)}>
              View profile
            </InternalLink>
          </Button>
        </div>
      </div>
    </div>
  )
}
