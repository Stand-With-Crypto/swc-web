import * as Sentry from '@sentry/nextjs'
import useSWR, { SWRConfiguration } from 'swr'

import {
  DTSI_LocationSpecificRacesInformationQuery,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { fetchReq } from '@/utils/shared/fetchReq'
import {
  CongressionalDistrictFromAddress,
  getCongressionalDistrictFromAddress,
} from '@/utils/shared/getCongressionalDistrictFromAddress'
import { apiUrls } from '@/utils/shared/urls'

export type RacesByAddressData = Awaited<ReturnType<typeof getDTSIRacesFromCongressionalDistrict>>

export function useRacesByAddress(
  _address?: string | null,
  options: SWRConfiguration<RacesByAddressData> = {},
) {
  return useSWR<RacesByAddressData>(
    _address ? [_address, 'useRacesByAddress'] : null,
    async ([address]) => {
      const result = await getCongressionalDistrictFromAddress(address)
      return getDTSIRacesFromCongressionalDistrict(result)
    },
    options,
  )
}

async function getDTSIRacesFromCongressionalDistrict(result: CongressionalDistrictFromAddress) {
  if ('notFoundReason' in result) {
    throw new Error(getErrorMessageByNotFoundReason(result.notFoundReason))
  }

  const data = await fetchReq(
    apiUrls.dtsiRacesByCongressionalDistrict({
      stateCode: result.stateCode,
      district: result.districtNumber,
    }),
  )
    .then(res => res.json())
    .then(data => data as DTSI_LocationSpecificRacesInformationQuery)
    .catch(e => {
      Sentry.captureException(e, {
        tags: { domain: 'getDTSIRacesFromCongressionalDistrict' },
        extra: { congressionalDistrictFromAddressResult: result },
      })
      return { notFoundReason: 'UNEXPECTED_ERROR' as const }
    })

  if ('notFoundReason' in data) {
    throw new Error(getErrorMessageByNotFoundReason(data.notFoundReason))
  }

  if (!data.congressional.length && !data.presidential.length && !data.senate.length) {
    return {
      ...data,
      congressional: [],
      presidential: [],
      senate: [],
      stateCode: result.stateCode,
      districtNumber: result.districtNumber,
    }
  }

  if (data?.presidential) {
    const partyOrder = [
      DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
      DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
      DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT,
    ]

    data.presidential?.sort((a, b) => {
      const aPartyIndex = a.politicalAffiliationCategory
        ? partyOrder.indexOf(a.politicalAffiliationCategory)
        : -1
      const bPartyIndex = b.politicalAffiliationCategory
        ? partyOrder.indexOf(b.politicalAffiliationCategory)
        : -1
      if (aPartyIndex !== bPartyIndex) {
        return aPartyIndex - bPartyIndex
      }
      if (a.primaryRole?.roleCategory !== b.primaryRole?.roleCategory) {
        return a.primaryRole?.roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? -1 : 1
      }
      return 0
    })
  }

  return { ...result, ...data }
}

function getErrorMessageByNotFoundReason(notFoundReason: string) {
  switch (notFoundReason) {
    case 'NOT_USA_ADDRESS':
      return 'Please enter a US-based address.'
    case 'NOT_SAME_STATE':
      return "Looks like you entered an address that's not in this state."
    case 'NOT_SPECIFIC_ENOUGH':
      return 'Please enter a specific address that includes street-level information.'
    case 'CIVIC_API_DOWN':
      return "Looks like we're having some issues finding your representative right now. Please come back later and try again."
    case 'MISSING_FROM_DTSI':
    case 'UNEXPECTED_ERROR':
    default:
      return "We can't find your representative right now, we're working on a fix"
  }
}
