import useSWR from 'swr'

import { getElectoralZoneFromAddressOrPlaceId } from '@/utils/shared/getElectoralZoneFromAddress'

export function useGetDistrictFromAddress(address?: string | null) {
  return useSWR(address ? `useGetDistrictFromAddress-${address}` : null, () =>
    getElectoralZoneFromAddressOrPlaceId({ address: address! }),
  )
}
