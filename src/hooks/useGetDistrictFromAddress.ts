import useSWR, { SWRConfiguration } from 'swr'

import {
  getCongressionalDistrictFromAddress,
  GetCongressionalDistrictFromAddressParams,
} from '@/utils/shared/getCongressionalDistrictFromAddress'

export function useGetDistrictFromAddress(
  address: string,
  params?: GetCongressionalDistrictFromAddressParams,
) {
  return useSWR(
    address ? `useGetDistrictFromAddress-${address}-${JSON.stringify(params)}` : null,
    () => getCongressionalDistrictFromAddress(address, params),
  )
}
