import useSWR from 'swr'

import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { fetchReq } from '@/utils/shared/fetchReq'
import {
  CongressionalDistrictFromAddress,
  getCongressionalDistrictFromAddress,
  GetCongressionalDistrictFromAddressSuccess,
} from '@/utils/shared/getCongressionalDistrictFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import {
  LEGISLATIVE_AND_EXECUTIVE_ROLE_CATEGORIES,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

export interface DTSIPeopleFromUSCongressionalDistrict
  extends GetCongressionalDistrictFromAddressSuccess {
  dtsiPeople: DTSIPeopleByElectoralZoneQueryResult
}

export type UseGetDTSIPeopleFromUSAddressResponse = Awaited<
  ReturnType<typeof getDTSIPeopleFromUSAddress>
>

async function getDTSIPeopleFromCongressionalDistrict(
  result: CongressionalDistrictFromAddress,
  category: YourPoliticianCategory,
) {
  if ('notFoundReason' in result) {
    return result
  }

  const data = await fetchReq(
    apiUrls.dtsiPeopleByElectoralZone({
      electoralZone: String(result.districtNumber),
      stateCode: String(result.stateCode),
      countryCode: SupportedCountryCodes.US,
    }),
  )
    .then(res => res.json())
    .then(data => data as DTSIPeopleByElectoralZoneQueryResult)
    .catch(e => {
      catchUnexpectedServerErrorAndTriggerToast(e)
      return { notFoundReason: 'UNEXPECTED_ERROR' as const }
    })
  const dtsiPeople = data as DTSIPeopleByElectoralZoneQueryResult

  if ('notFoundReason' in data) {
    return data
  }

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

  return { ...result, dtsiPeople: filteredData }
}

/** @deprecated Use getDTSIPeopleFromAddress instead */
export async function getDTSIPeopleFromUSAddress(
  category: YourPoliticianCategory,
  address?: string | null,
) {
  const result = await getCongressionalDistrictFromAddress(address)

  return getDTSIPeopleFromCongressionalDistrict(result, category)
}

/** @deprecated Use useGetDTSIPeopleFromAddress instead */
export function useGetDTSIPeopleFromUSAddress(
  category: YourPoliticianCategory,
  address?: string | null,
) {
  return useSWR(address ? `useGetDTSIPeopleFromAddress-${address}` : null, () =>
    getDTSIPeopleFromUSAddress(category, address),
  )
}

export function formatGetDTSIPeopleFromUSAddressNotFoundReason(
  data: Pick<UseGetDTSIPeopleFromUSAddressResponse, 'notFoundReason'> | undefined | null,
) {
  const defaultError = "We can't find your representative right now, we're working on a fix"
  if (!data || !('notFoundReason' in data)) {
    return defaultError
  }

  switch (data.notFoundReason) {
    case 'NOT_USA_ADDRESS':
      return 'Please enter a US-based address.'
    case 'NOT_SAME_STATE':
      return "Looks like you entered an address that's not in this state."
    case 'NOT_SPECIFIC_ENOUGH':
      return 'Please enter a specific address that includes street-level information.'
    case 'CIVIC_API_DOWN':
      return "Looks like we're having some issues finding your representative right now. Please come back later and try again."
    case 'MISSING_FROM_DTSI':
    case 'UNEXPECTED_ERROR':
    default:
      return defaultError
  }
}
