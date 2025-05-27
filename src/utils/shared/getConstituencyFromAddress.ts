import { Address } from '@prisma/client'

import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export type ConstituencyFromAddress = Awaited<ReturnType<typeof getConstituencyFromAddress>>

export async function maybeGetConstituencyFromAddress(
  address?: Pick<Address, 'countryCode' | 'formattedDescription'> | null,
) {
  if (!address) {
    return { notFoundReason: 'USER_WITHOUT_ADDRESS' as const }
  }

  const constituency = await getConstituencyFromAddress(address.formattedDescription)

  return constituency
}

export async function getConstituencyFromAddress(address: string) {
  try {
    const response = await fetchReq(apiUrls.swcCivicConstituencyFromAddress(address))

    const data = (await response.json()) as {
      name: string
      stateCode?: string
    }

    return data
  } catch (error) {
    console.error('Error fetching constituency:', error)

    if (error instanceof Response) {
      console.log('Response error status:', error.status)
      // TODO: maybe add a code to the error
      if (error.status === 404) {
        console.log('Constituency not found (404)')
        return {
          notFoundReason: 'CONSTITUENCY_NOT_FOUND' as const,
        }
      }
      console.log('Unexpected response error:', error.status)
    }

    console.log(
      'Unexpected error occurred:',
      error instanceof Error ? error.message : 'Unknown error type',
    )
    return {
      notFoundReason: 'UNEXPECTED_ERROR' as const,
    }
  }
}
