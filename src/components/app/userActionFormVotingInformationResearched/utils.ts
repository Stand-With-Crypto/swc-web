import { z } from 'zod'

import { zodAddress } from '@/validation/fields/zodAddress'

export const buildElectoralUrl = (address: z.infer<typeof zodAddress>) => {
  const baseUrl = 'https://turbovote.org/'

  const params = new URLSearchParams({
    street: `${address.streetNumber} ${address.route}`,
    city: address.locality,
    state: address.administrativeAreaLevel1,
    zip: address.postalCode,
  })

  return new URL(`/search/address?${params.toString()}`, baseUrl)
}
