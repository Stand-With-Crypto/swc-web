'use client'
import { useEffect } from 'react'
import { isNil } from 'lodash-es'
import { z } from 'zod'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { getRoleNameResolver } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  getYourPoliticianCategoryDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

export function DTSICongresspersonAssociatedWithFormAddress({
  address,
  onChangeAddress,
  politicianCategory,
  dtsiPeopleFromAddressResponse,
  countryCode,
}: {
  countryCode: SupportedCountryCodes
  politicianCategory: YourPoliticianCategory
  address?: z.infer<typeof zodGooglePlacesAutocompletePrediction>
  onChangeAddress: (args: {
    location?: {
      zoneName: string
      stateCode: string | null
    }
  }) => void
  dtsiPeopleFromAddressResponse: ReturnType<typeof useGetDTSIPeopleFromAddress>
}) {
  const roleNameResolver = getRoleNameResolver(countryCode)

  useEffect(() => {
    if (dtsiPeopleFromAddressResponse?.data && 'dtsiPeople' in dtsiPeopleFromAddressResponse.data) {
      const { stateCode, zoneName } = dtsiPeopleFromAddressResponse.data
      onChangeAddress({ location: { zoneName, stateCode } })
    }
    // onChangeAddress shouldnt be passed as a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtsiPeopleFromAddressResponse?.data])

  const categoryDisplayName = getYourPoliticianCategoryDisplayName(politicianCategory)
  if (!address || dtsiPeopleFromAddressResponse?.isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 flex-shrink-0" />
        <div className="text-sm md:text-base">
          <p className="bold">Your {categoryDisplayName}</p>
          <p className="text-fontcolor-muted">
            {dtsiPeopleFromAddressResponse?.isLoading
              ? 'Loading...'
              : 'This will show up after you enter your address'}
          </p>
        </div>
      </div>
    )
  }

  if (
    !dtsiPeopleFromAddressResponse?.data ||
    'notFoundReason' in dtsiPeopleFromAddressResponse.data
  ) {
    return (
      <div className="font-bold text-destructive">
        {formatGetDTSIPeopleFromAddressNotFoundReason(dtsiPeopleFromAddressResponse.data)}
      </div>
    )
  }

  const people = dtsiPeopleFromAddressResponse?.data?.dtsiPeople
  return (
    <div className="space-y-6">
      {people.map(person => (
        <div
          className="flex w-full flex-col justify-between sm:flex-row sm:items-center sm:gap-4"
          data-test-id="dtsi-person-associated-with-address"
          key={person.id}
        >
          <div className="flex items-center gap-4 text-sm md:text-base">
            <div className="flex-shrink-0">
              <DTSIAvatar person={person} size={60} />
            </div>
            <div>
              <div className="font-bold">{dtsiPersonFullName(person)}</div>
              <div className="text-fontcolor-muted">
                Your{' '}
                {person.primaryRole
                  ? roleNameResolver(person.primaryRole).toLowerCase()
                  : gracefullyError({
                      msg: 'No primary role found',
                      fallback: 'representative',
                      hint: { extra: { person } },
                    })}
              </div>
            </div>
          </div>
          <div>
            <CryptoSupportHighlight
              className="max-sm:px-2 max-sm:py-2 max-sm:text-base"
              stanceScore={person.manuallyOverriddenStanceScore || person.computedStanceScore}
              text={
                isNil(person.manuallyOverriddenStanceScore || person.computedStanceScore)
                  ? 'Unknown stance on crypto'
                  : undefined
              }
            />
          </div>
        </div>
      ))}
    </div>
  )
}
