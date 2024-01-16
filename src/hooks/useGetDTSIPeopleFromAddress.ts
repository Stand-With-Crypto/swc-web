import { queryDTSIPeopleByCongressionalDistrict } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getCongressionalDistrictFromAddress } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { apiUrls } from '@/utils/shared/urls'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import useSWR from 'swr'

export function useGetDTSIPeopleFromAddress(address: string) {
  return useSWR(address ? `useGetDTSIPeopleFromAddress-${address}` : null, async () => {
    const result = await getCongressionalDistrictFromAddress(address)
    if ('notFoundReason' in result) {
      return result
    }
    return fetchReq(apiUrls.dtsiPeopleByCongressionalDistrict(result))
      .then(res => res.json())
      .then(data => {
        if (!data) {
          return { notFoundReason: 'MISSING_FROM_DTSI' as const }
        }
        return data as NonNullable<
          Awaited<ReturnType<typeof queryDTSIPeopleByCongressionalDistrict>>
        >
      })
      .catch(e => {
        catchUnexpectedServerErrorAndTriggerToast(e)
        return { notFoundReason: 'UNEXPECTED_ERROR' as const }
      })
  })
}
