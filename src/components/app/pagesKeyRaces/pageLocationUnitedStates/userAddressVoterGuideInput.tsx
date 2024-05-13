/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

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
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

function DefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <div className="mx-auto max-w-md">
      <GooglePlacesSelect
        className="rounded-full bg-gray-100 text-gray-600"
        disablePreventMobileKeyboardOffset
        placeholder="Enter your address"
        {...props}
      />
    </div>
  )
}
interface UserAddressVoterGuideInput {
  locale: SupportedLocale
  onChange?: GooglePlacesSelectProps['onChange']
}

export function UserAddressVoterGuideInput(props: UserAddressVoterGuideInput) {
  return (
    <Suspense fallback={<DefaultPlacesSelect onChange={noop} value={null} />}>
      <_UserAddressVoterGuideInput {...props} />
    </Suspense>
  )
}

const POLITICIAN_CATEGORY: YourPoliticianCategory = 'senate-and-house'

function _UserAddressVoterGuideInput({ locale, onChange = noop }: UserAddressVoterGuideInput) {
  const { setAddress, address } = useMutableCurrentUserAddress()
  const res = useGetDTSIPeopleFromAddress(
    address === 'loading' ? '' : address?.description || '',
    POLITICIAN_CATEGORY,
    {
      onSuccess: () => {
        onChange(address as GooglePlaceAutocompletePrediction)
      },
    },
  )

  const handleAddressChange: GooglePlacesSelectProps['onChange'] = newAddress => {
    setAddress(newAddress)
    if (!newAddress) {
      onChange(null)
    }
  }

  if (!address || address === 'loading' || !res.data) {
    return (
      <DefaultPlacesSelect
        loading={address === 'loading' || res.isLoading}
        onChange={handleAddressChange}
        value={address === 'loading' ? null : address}
      />
    )
  }
  if ('notFoundReason' in res.data) {
    return (
      <div>
        {formatGetDTSIPeopleFromAddressNotFoundReason(res.data)}{' '}
        <button
          className="font-bold text-fontcolor underline"
          onClick={() => handleAddressChange(null)}
        >
          Try another address.
        </button>
      </div>
    )
  }
  const stateCode = res.data.dtsiPeople.find(x => x.primaryRole?.primaryState)?.primaryRole
    ?.primaryState as USStateCode | undefined

  const urls = getIntlUrls(locale)
  return (
    <div>
      <p className="mb-3 text-center text-sm text-fontcolor-muted">
        {stateCode ? 'Showing voter guide for' : 'No voter guide info related to'}{' '}
        <button
          className="font-bold text-fontcolor underline"
          onClick={() => handleAddressChange(null)}
        >
          {address.description}
        </button>
      </p>

      {stateCode && (
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-3xl bg-muted p-6 sm:flex-row">
          <div>
            <h4 className="text-xl font-bold">Your crypto voter guide</h4>
            <p className="mt-4 text-fontcolor-muted">
              It looks like you’re in {US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]}. Take a look at
              our crypto voter guide for more key info on the role your state plays in crypto
              regulation.
            </p>
          </div>
          <div className="max-sm:w-full">
            <Button asChild className="w-full">
              <InternalLink href={urls.locationStateSpecific(stateCode)}>
                {stateCode} voter guide
              </InternalLink>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
