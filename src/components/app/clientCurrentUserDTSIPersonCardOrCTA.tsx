/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { Spinner } from '@/components/ui/spinner'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  filterDTSIPeopleByPoliticalCategory,
  getYourPoliticianCategoryDisplayName,
} from '@/utils/shared/yourPoliticianCategory'
import { YourPoliticianCategory as AUYourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/au'
import { YourPoliticianCategory as CAYourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/ca'
import { YourPoliticianCategory as GBYourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/gb'
import { YourPoliticianCategory as USYourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/us'
import { cn } from '@/utils/web/cn'

function DefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
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

type ClientCurrentUserDTSIPersonCardOrCTAProps =
  | {
      countryCode: SupportedCountryCodes.US
      category: USYourPoliticianCategory
    }
  | {
      countryCode: SupportedCountryCodes.AU
      category: AUYourPoliticianCategory
    }
  | {
      countryCode: SupportedCountryCodes.CA
      category: CAYourPoliticianCategory
    }
  | {
      countryCode: SupportedCountryCodes.GB
      category: GBYourPoliticianCategory
    }

export function ClientCurrentUserDTSIPersonCardOrCTA(
  props: ClientCurrentUserDTSIPersonCardOrCTAProps,
) {
  return (
    <Suspense fallback={<DefaultPlacesSelect onChange={noop} value={null} />}>
      <SuspenseClientCurrentUserDTSIPersonCardOrCTA {...props} />
    </Suspense>
  )
}

function SuspenseClientCurrentUserDTSIPersonCardOrCTA(
  props: ClientCurrentUserDTSIPersonCardOrCTAProps,
) {
  const { countryCode } = props

  const { setAddress, address } = useMutableCurrentUserAddress()
  const res = useGetDTSIPeopleFromAddress({
    filterFn: filterDTSIPeopleByPoliticalCategory(props),
    address: address === 'loading' ? null : address?.description,
  })

  if (!address || address === 'loading') {
    return (
      <DefaultPlacesSelect
        loading={address === 'loading'}
        onChange={setAddress}
        value={address === 'loading' ? null : address}
      />
    )
  }

  if (!res.data || res.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if ('notFoundReason' in res.data) {
    return (
      <PageSubTitle as="h4" size="sm">
        {formatGetDTSIPeopleFromAddressNotFoundReason(res.data)}{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          Try another address.
        </button>
      </PageSubTitle>
    )
  }
  const people = res.data.dtsiPeople
  const categoryDisplayName = getYourPoliticianCategoryDisplayName(props)

  return (
    <div>
      <p className="mb-3 text-center text-sm text-fontcolor-muted">
        Showing politicians for{' '}
        <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
          {address.description}
        </button>
      </p>
      <p
        className="mb-3 text-center text-xl font-bold"
        data-test-id="dtsi-people-associated-with-address"
      >
        Your {categoryDisplayName}
      </p>
      <DTSIPersonHeroCardRow className={cn('gap-2 max-sm:justify-normal lg:px-0')}>
        {people.map(person => (
          <DTSIPersonHeroCard
            className={cn('sm:h-64 sm:w-60')}
            countryCode={countryCode}
            cryptoStanceGrade={DTSIFormattedLetterGrade}
            key={person.id}
            person={person}
            shouldHideStanceScores={
              person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.GOVERNOR ||
              person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.ATTORNEY_GENERAL
            }
            subheader="role"
            wrapperClassName={cn('sm:w-60')}
          />
        ))}
      </DTSIPersonHeroCardRow>
    </div>
  )
}
