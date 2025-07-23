import useSWR from 'swr'

import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fetchReq } from '@/utils/shared/fetchReq'
import {
  ElectoralZoneNotFoundReason,
  getElectoralZoneFromAddressOrPlaceId,
} from '@/utils/shared/getElectoralZoneFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

export type UseGetDTSIPeopleFromPlaceIdResponse = Awaited<
  ReturnType<typeof getDTSIPeopleFromAddress>
>

export type DTSIPeopleFromAddressFilter = (
  dtsiPerson: DTSIPeopleByElectoralZoneQueryResult[number],
) => boolean

enum DTSIPeopleFromAddressNotFoundReason {
  INVALID_COUNTRY_CODE = 'INVALID_COUNTRY_CODE',
  MISSING_FROM_DTSI = 'MISSING_FROM_DTSI',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export async function getDTSIPeopleFromAddress({
  address,
  filterFn,
  countryCode,
  placeId,
}: {
  address: string
  placeId?: string
  filterFn: DTSIPeopleFromAddressFilter
  countryCode: SupportedCountryCodes
}) {
  const electoralZone = await getElectoralZoneFromAddressOrPlaceId({ address, placeId })

  if ('notFoundReason' in electoralZone) {
    return electoralZone
  }

  if (countryCode !== electoralZone.countryCode) {
    return {
      notFoundReason: DTSIPeopleFromAddressNotFoundReason.INVALID_COUNTRY_CODE,
    }
  }

  const data = await fetchReq(
    apiUrls.dtsiPeopleByElectoralZone({
      electoralZone: electoralZone.zoneName,
      stateCode: electoralZone.administrativeArea,
      countryCode,
    }),
  )
    .then(res => res.json())
    .then(data => data as DTSIPeopleByElectoralZoneQueryResult)
    .catch(e => {
      catchUnexpectedServerErrorAndTriggerToast(e)
      return { notFoundReason: DTSIPeopleFromAddressNotFoundReason.UNEXPECTED_ERROR }
    })

  if ('notFoundReason' in data) {
    return data
  }

  const dtsiPeople = data as DTSIPeopleByElectoralZoneQueryResult

  const filteredData = dtsiPeople.filter(filterFn)

  if (!filteredData.length) {
    return { notFoundReason: DTSIPeopleFromAddressNotFoundReason.MISSING_FROM_DTSI }
  }

  return { ...electoralZone, dtsiPeople: filteredData }
}

export function useGetDTSIPeopleFromAddress({
  address,
  filterFn,
  placeId,
}: {
  address?: string | null
  placeId?: string | null
  filterFn: DTSIPeopleFromAddressFilter
}) {
  const countryCode = useCountryCode()

  return useSWR(
    address || placeId ? `useGetDTSIPeopleFromAddress-${address || placeId || ''}` : null,
    async () => {
      if (!address && !placeId) {
        return
      }

      return getDTSIPeopleFromAddress({
        address: address || '',
        placeId: placeId || '',
        countryCode,
        filterFn,
      })
    },
  )
}

export function formatGetDTSIPeopleFromAddressNotFoundReason(
  data: Pick<UseGetDTSIPeopleFromPlaceIdResponse, 'notFoundReason'> | undefined | null,
) {
  const defaultError = "We can't find your representative right now, we're working on a fix"
  if (!data || !('notFoundReason' in data)) {
    return defaultError
  }

  switch (data.notFoundReason) {
    case DTSIPeopleFromAddressNotFoundReason.INVALID_COUNTRY_CODE:
      return 'Please enter an address from your selected country'
    case ElectoralZoneNotFoundReason.ELECTORAL_ZONE_NOT_FOUND:
    case DTSIPeopleFromAddressNotFoundReason.MISSING_FROM_DTSI:
    case DTSIPeopleFromAddressNotFoundReason.UNEXPECTED_ERROR:
    default:
      return defaultError
  }
}
