import useSWR from 'swr'

import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getElectoralZoneFromAddressOrPlaceId } from '@/utils/shared/getElectoralZoneFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

export type UseGetDTSIPeopleFromPlaceIdResponse = Awaited<
  ReturnType<typeof getDTSIPeopleFromAddress>
>

export type DTSIPeopleFromAddressFilter = (
  dtsiPerson: DTSIPeopleByElectoralZoneQueryResult[number],
) => boolean

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
      notFoundReason: 'INVALID_COUNTRY_CODE' as const,
    }
  }

  const data = await fetchReq(
    apiUrls.dtsiPeopleByElectoralZone({
      electoralZone: electoralZone.zoneName,
      stateCode: electoralZone.stateCode,
      countryCode,
    }),
  )
    .then(res => res.json())
    .then(data => data as DTSIPeopleByElectoralZoneQueryResult)
    .catch(e => {
      catchUnexpectedServerErrorAndTriggerToast(e)
      return { notFoundReason: 'UNEXPECTED_ERROR' as const }
    })
  const dtsiPeople = data as DTSIPeopleByElectoralZoneQueryResult

  const filteredData = dtsiPeople.filter(filterFn)

  if (!filteredData.length) {
    return { notFoundReason: 'MISSING_FROM_DTSI' as const }
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
    case 'INVALID_COUNTRY_CODE':
      return 'Please enter an address from your selected country'
    case 'ELECTORAL_ZONE_NOT_FOUND':
    case 'MISSING_FROM_DTSI':
    case 'UNEXPECTED_ERROR':
    default:
      return defaultError
  }
}
