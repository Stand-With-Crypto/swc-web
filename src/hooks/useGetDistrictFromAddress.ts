import useSWR from 'swr'

import { getElectoralZoneFromAddress } from '@/utils/shared/getElectoralZoneFromAddress'

export function useGetDistrictFromAddress(address?: string | null) {
  return useSWR(address ? `useGetDistrictFromAddress-${address}` : null, () =>
    getElectoralZoneFromAddress(address!),
  )
}
