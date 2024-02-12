'use client'
import { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'

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
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { possessive } from '@/utils/shared/possessive'
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
  useEffect(() => {
    if (userAddress) {
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
  const score = person.manuallyOverriddenStanceScore || person.computedStanceScore
  return (
    <div>
      <p className="mb-3 text-xl font-bold">Your representative</p>
      <p className="mb-3 text-sm text-fontcolor-muted">
        Show representative for{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          {address.description}
        </button>
      </p>
      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-blue-50 p-5 text-left md:flex-row md:gap-10">
        <div className="flex flex-row items-center gap-4 text-sm md:text-base">
          <div className="relative">
            <DTSIAvatar person={person} size={60} />
            <div className="absolute bottom-[-8px] right-[-8px]">
              <DTSIFormattedLetterGrade person={person} size={25} />
            </div>
          </div>
          <div>
            <div className="font-bold">Your representative is {dtsiPersonFullName(person)}</div>
            <div className="text-fontcolor-muted">
              {_.isNil(score) || score < 60 ? (
                <>
                  Learn how to change {possessive(person.firstNickname || person.firstName)} stance
                  on crypto.
                </>
              ) : (
                <>
                  Let {possessive(person.firstNickname || person.firstName)} know how important
                  pro-crypto politicians are to you.
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 md:gap-2">
          <UserActionFormCallCongresspersonDialog>
            <Button size="lg">Call</Button>
          </UserActionFormCallCongresspersonDialog>
          <Button asChild variant="link">
            <InternalLink href={getIntlUrls(locale).politicianDetails(person.slug)}>
              View profile
            </InternalLink>
          </Button>
        </div>
      </div>
    </div>
  )
}
