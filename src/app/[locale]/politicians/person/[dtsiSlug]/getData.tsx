import { cache } from 'react'

import { queryDTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'

export const getData = cache(async (dtsiSlug: string) => {
  const person = await queryDTSIPersonDetails(dtsiSlug).catch(() => null)
  return person
})
