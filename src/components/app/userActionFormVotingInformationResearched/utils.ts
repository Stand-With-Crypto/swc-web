import { z } from 'zod'

import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { zodAddress } from '@/validation/fields/zodAddress'

export const buildElectoralUrl = (address: z.infer<typeof zodAddress>) => {
  const baseUrl = 'https://turbovote.org/'
  const state = address.administrativeAreaLevel1
  const electionDate = '2024-11-05'

  const params = new URLSearchParams({
    street: `${address.streetNumber} ${address.route}`,
    city: getUSStateNameFromStateCode(state),
    state,
    zip: address.postalCode,
  })

  return new URL(`/elections/${state.toLowerCase()}/${electionDate}?${params.toString()}`, baseUrl)
}
