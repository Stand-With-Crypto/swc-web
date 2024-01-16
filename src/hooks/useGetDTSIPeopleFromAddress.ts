import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getCongressionalDistrictFromAddress } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { apiUrls } from '@/utils/shared/urls'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import useSWR from 'swr'

export type UseGetDTSIPeopleFromAddressResponse =
  | DTSIPeopleByCongressionalDistrictQueryResult
  | { notFoundReason: string }

export async function getDTSIPeopleFromAddress(address: string) {
  const result = await getCongressionalDistrictFromAddress(address)
  if ('notFoundReason' in result) {
    return result
  }

  const data = await fetchReq(apiUrls.dtsiPeopleByCongressionalDistrict(result))
    .then(res => res.json())
    .catch(e => {
      catchUnexpectedServerErrorAndTriggerToast(e)
      return { notFoundReason: 'UNEXPECTED_ERROR' as const }
    })

  if (!data) {
    return { notFoundReason: 'MISSING_FROM_DTSI' as const }
  }

  return data as DTSIPeopleByCongressionalDistrictQueryResult
}

export function useGetDTSIPeopleFromAddress(address: string) {
  return useSWR<UseGetDTSIPeopleFromAddressResponse>(
    address ? `useGetDTSIPeopleFromAddress-${address}` : null,
    getDTSIPeopleFromAddress,
  )
}
