import useSWR from 'swr'

import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getElectoralZoneFromAddress } from '@/utils/shared/getElectoralZoneFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import {
  LEGISLATIVE_AND_EXECUTIVE_ROLE_CATEGORIES,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

export type UseGetDTSIPeopleFromPlaceIdResponse = Awaited<
  ReturnType<typeof getDTSIPeopleFromAddress>
>

export async function getDTSIPeopleFromAddress({
  address,
  category,
  countryCode,
}: {
  address: string
  category: YourPoliticianCategory
  countryCode: SupportedCountryCodes
}) {
  const electoralZone = await getElectoralZoneFromAddress(address)

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

  let filteredData: DTSIPeopleByElectoralZoneQueryResult = []

  switch (category) {
    case 'senate':
      filteredData = dtsiPeople.filter(
        person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE,
      )
      break
    case 'house':
      filteredData = dtsiPeople.filter(
        person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
      )
      break
    case 'senate-and-house':
      filteredData = dtsiPeople.filter(
        person =>
          person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE ||
          person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
      )
      break
    case 'legislative-and-executive':
      filteredData = dtsiPeople.filter(
        person =>
          person.primaryRole?.roleCategory &&
          LEGISLATIVE_AND_EXECUTIVE_ROLE_CATEGORIES.includes(person.primaryRole.roleCategory),
      )
      break
    default:
      filteredData = dtsiPeople
  }

  if (!filteredData.length) {
    return { notFoundReason: 'MISSING_FROM_DTSI' as const }
  }

  return { ...electoralZone, dtsiPeople: filteredData }
}

export function useGetDTSIPeopleFromAddress({
  address,
  category,
}: {
  address?: string | null
  category: YourPoliticianCategory
}) {
  const countryCode = useCountryCode()

  return useSWR(address ? `useGetDTSIPeopleFromAddress-${address}` : null, async () => {
    if (!address) {
      return
    }

    return getDTSIPeopleFromAddress({
      address,
      countryCode,
      category,
    })
  })
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
