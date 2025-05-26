import { GetConstituencyResult } from '@/utils/server/swcCivic/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { Address } from '@prisma/client'

export type ConstituencyFromAddress = Awaited<ReturnType<typeof getConstituencyFromAddress>>

export async function maybeGetConstituencyFromAddress(
  address?: Pick<Address, 'countryCode' | 'formattedDescription'> | null,
) {
  if (!address) {
    return { notFoundReason: 'USER_WITHOUT_ADDRESS' as const }
  }

  const constituency = await getConstituencyFromAddress(
    address.formattedDescription,
    address.countryCode as SupportedCountryCodes,
  )

  return constituency
}

export async function getConstituencyFromAddress(
  address: string,
  countryCode: SupportedCountryCodes,
) {
  try {
    const response = await fetchReq(
      apiUrls.swcCivicConstituencyFromAddress({ address, countryCode }),
    )

    const data = (await response.json()) as GetConstituencyResult

    return data
  } catch (error) {
    console.error('Error fetching constituency:', error)

    if (error instanceof Response) {
      // TODO: maybe add a code to the error
      if (error.status === 404) {
        return {
          notFoundReason: 'CONSTITUENCY_NOT_FOUND' as const,
        }
      }
    }

    return {
      notFoundReason: 'UNEXPECTED_ERROR' as const,
    }
  }
}
