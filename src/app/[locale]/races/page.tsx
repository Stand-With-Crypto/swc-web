import { Metadata } from 'next'

import { LocationUnitedStatesLiveResults } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/organizePeople'
import { fetchRacesData } from '@/data/decisionDesk/services'
import { GetRacesResponse } from '@/data/decisionDesk/types'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { PageProps } from '@/types'
import { normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION['2_MINUTES']

type LocationUnitedStatesPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Who will defend crypto in America?'
  const description =
    'View live election results on for U.S. Senate Race (CA) on Stand With Crypto.'
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationUnitedStatesPage({ params }: LocationUnitedStatesPageProps) {
  const { locale } = params
  const [dtsiResults] = await Promise.all([queryDTSILocationUnitedStatesInformation()])

  const races = organizePeople(dtsiResults)

  const racesDataMap: Record<string, GetRacesResponse> = {}

  const racePromises = Object.entries(races.keyRaces).flatMap(([state, keyRaces]) =>
    keyRaces.map(async race => {
      const primaryDistrict = race[0].runningForSpecificRole.primaryDistrict
        ? normalizeDTSIDistrictId(race[0].runningForSpecificRole)
        : undefined

      const officeId = primaryDistrict ? '3' : '4'
      const key = `${state}_${primaryDistrict?.toString() || 'undefined'}_${officeId}`

      const raceData = await fetchRacesData({
        state,
        district: primaryDistrict?.toString(),
        office_id: officeId,
      })
      racesDataMap[key] = raceData
    }),
  )

  await Promise.all(racePromises)

  return (
    <LocationUnitedStatesLiveResults ddhqResults={racesDataMap} locale={locale} races={races} />
  )
}
