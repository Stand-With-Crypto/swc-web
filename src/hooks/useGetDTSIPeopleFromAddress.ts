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

async function getDTSIPeopleFromCongressionalDistrict(
  result: CongressionalDistrictFromAddress,
  category: YourPoliticianCategory,
) {
  if ('notFoundReason' in result) {
    return result
  }

  const data = await fetchReq(apiUrls.dtsiPeopleByCongressionalDistrict(result))
    .then(res => res.json())
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

  if (!filteredData.length) {
    return { notFoundReason: 'MISSING_FROM_DTSI' as const }
  }

  return { ...result, dtsiPeople: filteredData } as DTSIPeopleFromCongressionalDistrict
}

export async function getDTSIPeopleFromAddress(address: string, category: YourPoliticianCategory) {
  const result = await getCongressionalDistrictFromAddress(address)

  return getDTSIPeopleFromCongressionalDistrict(result, category)
}

export type UseGetDTSIPeopleFromAddressResponse = Awaited<
  ReturnType<typeof getDTSIPeopleFromAddress>
>

export function useGetDTSIPeopleFromAddress(address: string, category: YourPoliticianCategory) {
  return useSWR<UseGetDTSIPeopleFromAddressResponse>(
    address ? `useGetDTSIPeopleFromAddress-${address}` : null,
    () => getDTSIPeopleFromAddress(address, category),
  )
}
export function formatGetDTSIPeopleFromAddressNotFoundReason(
  data: Exclude<UseGetDTSIPeopleFromAddressResponse, { id: string }> | undefined | null,
) {
  const defaultError = "We can't find your representative right now, we're working on a fix"
  if (!data || !('notFoundReason' in data)) {
    return defaultError
  }

  switch (data.notFoundReason) {
    case 'NOT_USA_ADDRESS':
      return 'Please enter a US-based address.'
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
