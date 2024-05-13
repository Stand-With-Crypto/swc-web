import useSWR, { SWRConfiguration } from 'swr'

import {
  getCongressionalDistrictFromAddress,
  GetCongressionalDistrictFromAddressParams,
} from '@/utils/shared/getCongressionalDistrictFromAddress'

export function useGetDistrictFromAddress(
  address: string,
  params?: GetCongressionalDistrictFromAddressParams,
  config?: SWRConfiguration,
) {
  return useSWR(
    address ? `useGetDistrictFromAddress-${address}-${JSON.stringify(params)}` : null,
    () => getCongressionalDistrictFromAddress(address, params),
    config,
  )
}
