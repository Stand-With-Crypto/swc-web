import useSWR from 'swr'

import {
  getCongressionalDistrictFromAddress,
  GetCongressionalDistrictFromAddressParams,
} from '@/utils/shared/getCongressionalDistrictFromAddress'

export function useGetDistrictFromAddress(
  address?: string | null,
  params?: GetCongressionalDistrictFromAddressParams,
) {
  return useSWR(
    address ? `useGetDistrictFromAddress-${address}-${JSON.stringify(params)}` : null,
    () => getCongressionalDistrictFromAddress(address, params),
  )
}
