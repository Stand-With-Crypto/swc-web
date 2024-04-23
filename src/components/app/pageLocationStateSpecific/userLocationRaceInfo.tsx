/* eslint-disable @next/next/no-img-element */
'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { LocationSpecificRaceInfo } from '@/components/app/pageLocationStateSpecific/locationSpecificRaceInfo'
import { organizeStateSpecificPeople } from '@/components/app/pageLocationStateSpecific/organizeStateSpecificPeople'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { SupportedLocale } from '@/intl/locales'
import { formatGetCongressionalDistrictFromAddressNotFoundReason } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

type UserLocationRaceInfoProps = {
  groups: ReturnType<typeof organizeStateSpecificPeople>
  stateCode: USStateCode
  locale: SupportedLocale
}

function DefaultPlacesSelect({
  stateCode,
  ...props
}: Pick<GooglePlacesSelectProps, 'onChange' | 'value'> & { stateCode: USStateCode }) {
  return (
    <section>
      <PageTitle as="h3" className="mb-3" size="sm">
        Your District
      </PageTitle>
      <div className="mx-auto max-w-xl">
        <GooglePlacesSelect
          className="rounded-full bg-gray-100 text-gray-600"
          placeholder={`Enter a ${US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]} address`}
          {...props}
        />
      </div>
    </section>
  )
}

export function UserLocationRaceInfo(props: UserLocationRaceInfoProps) {
  return (
    <Suspense
      fallback={<DefaultPlacesSelect onChange={noop} stateCode={props.stateCode} value={null} />}
    >
      <_UserLocationRaceInfo {...props} />
    </Suspense>
  )
}

function _UserLocationRaceInfo({ groups, stateCode, locale }: UserLocationRaceInfoProps) {
  const urls = useIntlUrls()
  const { setAddress, address } = useMutableCurrentUserAddress()
  const res = useGetDistrictFromAddress(address === 'loading' ? '' : address?.description || '', {
    stateCode,
  })
  if (!address || address === 'loading' || !res.data) {
    return (
      <DefaultPlacesSelect
        onChange={setAddress}
        stateCode={stateCode}
        value={address === 'loading' ? null : address}
      />
    )
  }
  if ('notFoundReason' in res.data) {
    return (
      <section>
        <PageTitle as="h3" className="mb-3" size="sm">
          Your District
        </PageTitle>
        <div className="text-center">
          {formatGetCongressionalDistrictFromAddressNotFoundReason(res.data)}{' '}
          <button className="font-bold text-fontcolor underline" onClick={() => setAddress(null)}>
            Enter new address.
          </button>
        </div>
      </section>
    )
  }
  const { districtNumber } = res.data
  const group = groups.congresspeople[districtNumber]
  return (
    <LocationSpecificRaceInfo
      candidates={group.people}
      locale={locale}
      title={<>Your District ({districtNumber})</>}
      url={urls.locationDistrictSpecific({ stateCode, district: districtNumber })}
    >
      <p className="mt-3 text-center text-lg text-fontcolor-muted">
        Showing district for{' '}
        <button className="text-primary-cta" onClick={() => setAddress(null)}>
          {address.description}
        </button>
      </p>
    </LocationSpecificRaceInfo>
  )
}
