'use client'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { possessive } from '@/utils/shared/possessive'
import { getIntlUrls } from '@/utils/shared/urls'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'
import { useEffect, useState } from 'react'

export function ClientCurrentUserDTSIPersonCardOrCTA({ locale }: { locale: SupportedLocale }) {
  const user = useApiResponseForUserFullProfileInfo()
  const userAddress = user.data?.user?.address
  const [address, setAddress] = useState<GooglePlaceAutocompletePrediction | null>(
    userAddress
      ? {
          place_id: userAddress.googlePlaceId,
          description: userAddress.formattedDescription,
        }
      : null,
  )
  const res = useGetDTSIPeopleFromAddress(address?.description || '')
  useEffect(() => {
    if (userAddress) {
      setAddress({
        place_id: userAddress.googlePlaceId,
        description: userAddress.formattedDescription,
      })
    }
  }, [userAddress])
  if (!address || !res.data) {
    return (
      <div className="mx-auto max-w-md">
        {/* TODO style */}
        <GooglePlacesSelect
          className="rounded-full bg-gray-100 text-gray-600"
          placeholder="Enter your address"
          value={address}
          onChange={setAddress}
        />
        <p className="mt-2 text-xs text-fontcolor-muted">
          Enter your address to find your representatives
        </p>
      </div>
    )
  }
  if ('notFoundReason' in res.data) {
    return (
      <div>
        {res.data.notFoundReason === 'NOT_USA_ADDRESS'
          ? "Currently you can only look up your representatives in the USA. We're actively working to make Stand With Crypto a global project"
          : `We can't find your representative right now, we're working on a fix :).`}
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
      <div className="flex flex-col items-center justify-between gap-4 rounded-md border bg-blue-50 p-5 text-left md:flex-row md:gap-10">
        <div className="flex flex-row items-center gap-4 text-sm md:text-base">
          <div className="relative">
            <DTSIAvatar person={person} size={60} />
            <div className="absolute bottom-[-8px] right-[-8px]">
              <DTSIFormattedLetterGrade size={25} person={person} />
            </div>
          </div>
          <div>
            <div className="font-bold">Your representative is {dtsiPersonFullName(person)}</div>
            <div className="text-fontcolor-muted">
              {/* TODO this needs different copy/UX if they're pro crypto */}
              Learn how to change {possessive(person.firstNickname || person.firstName)} stance on
              crypto.
            </div>
          </div>
        </div>
        <div className="flex gap-5 md:gap-2">
          <UserActionFormCallCongresspersonDialog>
            <Button size="lg">Call</Button>
          </UserActionFormCallCongresspersonDialog>
          <Button variant="secondary" asChild>
            <InternalLink href={getIntlUrls(locale).politicianDetails(person.slug)}>
              View profile
            </InternalLink>
          </Button>
        </div>
      </div>
    </div>
  )
}
