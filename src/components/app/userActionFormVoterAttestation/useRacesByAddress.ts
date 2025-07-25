import * as Sentry from '@sentry/nextjs'
import useSWR, { SWRConfiguration } from 'swr'

import {
  DTSI_LocationSpecificRacesInformationQuery,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { fetchReq } from '@/utils/shared/fetchReq'
import {
  getElectoralZoneFromAddressOrPlaceId,
  GetElectoralZoneResult,
} from '@/utils/shared/getElectoralZoneFromAddress'
import { apiUrls } from '@/utils/shared/urls'

export type RacesByAddressData = Awaited<ReturnType<typeof getDTSIRacesFromElectoralZone>>

export function useRacesByAddress(
  _address?: string | null,
  options: SWRConfiguration<RacesByAddressData> = {},
) {
  return useSWR<RacesByAddressData>(
    _address ? [_address, 'useRacesByAddress'] : null,
    async ([address]) => {
      const result = await getElectoralZoneFromAddressOrPlaceId({
        address,
      })
      return getDTSIRacesFromElectoralZone(result)
    },
    options,
  )
}

async function getDTSIRacesFromElectoralZone(result: GetElectoralZoneResult) {
  if ('notFoundReason' in result) {
    throw new Error(getErrorMessageByNotFoundReason(result.notFoundReason))
  }

  if (!result.administrativeArea) {
    throw new Error('State code not found for this address')
  }

  const data = await fetchReq(
    apiUrls.dtsiRacesByCongressionalDistrict({
      administrativeArea: result.administrativeArea,
      district: parseInt(result.zoneName, 10),
    }),
  )
    .then(res => res.json())
    .then(data => data as DTSI_LocationSpecificRacesInformationQuery)
    .catch(e => {
      Sentry.captureException(e, {
        tags: { domain: 'getDTSIRacesFromElectoralZone' },
        extra: { electoralZoneFromAddressResult: result },
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
      administrativeArea: result.administrativeArea,
      zoneName: result.zoneName,
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
    case 'ELECTORAL_ZONE_NOT_FOUND':
      return "We can't find your representative right now, we're working on a fix"
    case 'NOT_SPECIFIC_ENOUGH':
      return 'Please enter a specific address that includes street-level information.'
    case 'CIVIC_API_DOWN':
      return "Looks like we're having some issues finding your representative right now. Please come back later and try again."
    default:
      return "We can't find your representative right now, we're working on a fix"
  }
}
