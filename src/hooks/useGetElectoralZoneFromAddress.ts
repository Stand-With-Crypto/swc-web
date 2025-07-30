import useSWR from 'swr'

import { getElectoralZoneFromAddressOrPlaceId } from '@/utils/shared/getElectoralZoneFromAddress'

export function useGetElectoralZoneFromAddress({
  address,
  placeId,
}: {
  address?: string | null
  placeId?: string | null
}) {
  return useSWR(
    address || placeId ? `useGetElectoralZoneFromAddress-${address || ''}-${placeId || ''}` : null,
    () => getElectoralZoneFromAddressOrPlaceId({ address: address || '', placeId: placeId || '' }),
  )
}
