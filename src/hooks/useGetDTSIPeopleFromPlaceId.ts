import useSWR from 'swr'

import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getCongressionalDistrictFromLatLong } from '@/utils/shared/getCongressionalDistrictFromLatLong'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import {
  LEGISLATIVE_AND_EXECUTIVE_ROLE_CATEGORIES,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'
import { getLatLongFromGooglePlaceId } from '@/utils/web/googlePlaceUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

export type UseGetDTSIPeopleFromPlaceIdResponse = Awaited<
  ReturnType<typeof getDTSIPeopleFromLatLong>
>

export async function getDTSIPeopleFromLatLong({
  category,
  latitude,
  longitude,
  countryCode,
}: {
  category: YourPoliticianCategory
  latitude: number
  longitude: number
  countryCode: SupportedCountryCodes
}) {
  const congressionalDistrict = await getCongressionalDistrictFromLatLong({
    latitude,
    longitude,
    countryCode,
  })

  if (!congressionalDistrict) {
    return {
      notFoundReason: 'CONGRESSIONAL_DISTRICT_NOT_FOUND' as const,
    }
  }

  const data = await fetchReq(
    apiUrls.dtsiPeopleByCongressionalDistrict({
      congressionalDistrict: congressionalDistrict.name,
      stateCode: congressionalDistrict.stateCode,
      countryCode,
    }),
  )
    .then(res => res.json())
    .then(data => data as DTSIPeopleByCongressionalDistrictQueryResult)
    .catch(e => {
      catchUnexpectedServerErrorAndTriggerToast(e)
      return { notFoundReason: 'UNEXPECTED_ERROR' as const }
    })
  const dtsiPeople = data as DTSIPeopleByCongressionalDistrictQueryResult

  if ('notFoundReason' in data) {
    return data
  }

  let filteredData: DTSIPeopleByCongressionalDistrictQueryResult = []

  switch (category) {
    case 'senate':
      filteredData = dtsiPeople.filter(
        person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE,
      )
      break
    case 'house':
      filteredData = dtsiPeople.filter(
        person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
      )
      break
    case 'senate-and-house':
      filteredData = dtsiPeople.filter(
        person =>
          person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE ||
          person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
      )
      break
    case 'legislative-and-executive':
      filteredData = dtsiPeople.filter(
        person =>
          person.primaryRole?.roleCategory &&
          LEGISLATIVE_AND_EXECUTIVE_ROLE_CATEGORIES.includes(person.primaryRole.roleCategory),
      )
      break
    default:
      filteredData = dtsiPeople
  }

  if (!filteredData.length) {
    return { notFoundReason: 'MISSING_FROM_DTSI' as const }
  }

  return { ...congressionalDistrict, dtsiPeople: filteredData }
}

export function useGetDTSIPeopleFromPlaceId({
  placeId,
  category,
}: {
  placeId?: string | null
  category: YourPoliticianCategory
}) {
  const countryCode = useCountryCode()

  return useSWR(placeId ? `useGetDTSIPeopleFromPlaceId-${placeId}` : null, async () => {
    if (!placeId) return

    const { lat, lng } = await getLatLongFromGooglePlaceId(placeId)

    if (!lat || !lng) return

    return getDTSIPeopleFromLatLong({
      countryCode,
      category,
      latitude: lat,
      longitude: lng,
    })
  })
}

export function formatGetDTSIPeopleFromPlaceIdNotFoundReason(
  data: Pick<UseGetDTSIPeopleFromPlaceIdResponse, 'notFoundReason'> | undefined | null,
) {
  const defaultError = "We can't find your representative right now, we're working on a fix"
  if (!data || !('notFoundReason' in data)) {
    return defaultError
  }

  switch (data.notFoundReason) {
    case 'CONGRESSIONAL_DISTRICT_NOT_FOUND':
    case 'MISSING_FROM_DTSI':
    case 'UNEXPECTED_ERROR':
    default:
      return defaultError
  }
}
