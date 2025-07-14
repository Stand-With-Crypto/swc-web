import useSWR from 'swr'

import { getElectoralZoneFromAddressOrPlaceId } from '@/utils/shared/getElectoralZoneFromAddress'

export function useGetDistrictFromAddress({
  address,
  placeId,
}: {
  address?: string | null
  placeId?: string | null
}) {
  return useSWR(
    address || placeId ? `useGetDistrictFromAddress-${address || ''}-${placeId || ''}` : null,
    () => getElectoralZoneFromAddressOrPlaceId({ address: address || '', placeId: placeId || '' }),
  )
}
