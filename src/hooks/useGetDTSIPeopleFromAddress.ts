import useSWR from 'swr'

import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { fetchReq } from '@/utils/shared/fetchReq'
import {
  CongressionalDistrictFromAddress,
  getCongressionalDistrictFromAddress,
  GetCongressionalDistrictFromAddressSuccess,
} from '@/utils/shared/getCongressionalDistrictFromAddress'
import { apiUrls } from '@/utils/shared/urls'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

export interface DTSIPeopleFromCongressionalDistrict
  extends GetCongressionalDistrictFromAddressSuccess {
  dtsiPeople: DTSIPeopleByCongressionalDistrictQueryResult
}

export type UseGetDTSIPeopleFromAddressResponse = Awaited<
  ReturnType<typeof getDTSIPeopleFromAddress>
>

async function getDTSIPeopleFromCongressionalDistrict(
  result: CongressionalDistrictFromAddress,
  category: YourPoliticianCategory,
) {
  if ('notFoundReason' in result) {
    return result
  }

  const data = await fetchReq(apiUrls.dtsiPeopleByCongressionalDistrict(result))
    .then(res => res.json())
    .then(data => data as DTSIPeopleByCongressionalDistrictQueryResult)
    .catch(e => {
      catchUnexpectedServerErrorAndTriggerToast(e)
      return { notFoundReason: 'UNEXPECTED_ERROR' as const }
    })
  const dtsiPeople = data as DTSIPeopleByCongressionalDistrictQueryResult

  const filteredData =
    category === 'senate-and-house'
      ? dtsiPeople
      : dtsiPeople.filter(
          person =>
            person.primaryRole?.roleCategory ===
            (category === 'senate'
              ? DTSI_PersonRoleCategory.SENATE
              : DTSI_PersonRoleCategory.CONGRESS),
        )

  if ('notFoundReason' in data) {
    return data
  }

  if (!filteredData.length) {
    return { notFoundReason: 'MISSING_FROM_DTSI' as const }
  }

  return { ...result, dtsiPeople: filteredData }
}

export async function getDTSIPeopleFromAddress(
  category: YourPoliticianCategory,
  address?: string | null,
) {
  const result = await getCongressionalDistrictFromAddress(address)

  return getDTSIPeopleFromCongressionalDistrict(result, category)
}
export function useGetDTSIPeopleFromAddress(
  category: YourPoliticianCategory,
  address?: string | null,
) {
  return useSWR(address ? `useGetDTSIPeopleFromAddress-${address}` : null, () =>
    getDTSIPeopleFromAddress(category, address),
  )
}
export function formatGetDTSIPeopleFromAddressNotFoundReason(
  data: Pick<UseGetDTSIPeopleFromAddressResponse, 'notFoundReason'> | undefined | null,
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
    case 'NO_REPS_IN_STATE':
      return 'No representatives in your state.'
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
