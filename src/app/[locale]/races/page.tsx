import * as Sentry from '@sentry/nextjs'
import { Metadata } from 'next'

import { LocationUnitedStatesLiveResults } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/organizePeople'
import { fetchElectoralCollege, fetchRacesData } from '@/data/decisionDesk/services'
import { GetElectoralCollegeResponse, GetRacesResponse } from '@/data/decisionDesk/types'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { PageProps } from '@/types'
import { normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'

export const dynamic = 'auto'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION['5_MINUTES']

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

  // const racePromises = Object.entries(races.keyRaces).flatMap(([state, keyRaces]) =>
  //   keyRaces.map(async race => {
  //     const primaryDistrict = race[0].runningForSpecificRole.primaryDistrict
  //       ? normalizeDTSIDistrictId(race[0].runningForSpecificRole)
  //       : undefined

  //     const officeId = primaryDistrict ? '3' : '4'
  //     const key = `${state}_${primaryDistrict?.toString() || 'undefined'}_${officeId}`

  //     try {
  //       // const raceData = await fetchRacesData({
  //       //   state,
  //       //   district: primaryDistrict?.toString(),
  //       //   office_id: officeId,
  //       // })
  //       // racesDataMap[key] = raceData
  //     } catch (error) {
  //       Sentry.captureException(error, {
  //         extra: { key },
  //       })
  //       console.log(`Error fetching race data for ${key}:`, error)
  //       racesDataMap[key] = {} as GetRacesResponse
  //     }
  //   }),
  // )
  // await Promise.all(racePromises)

  let presidentRaceData = {} as GetElectoralCollegeResponse
  try {
    presidentRaceData = await fetchElectoralCollege()
  } catch (error) {
    Sentry.captureException(error, {
      extra: { key: 'president' },
    })
    console.log(`Error fetching race data for ${'president'}:`, error)
    presidentRaceData = {} as GetElectoralCollegeResponse
  }

  return (
    <LocationUnitedStatesLiveResults
      ddhqResults={racesDataMap}
      locale={locale}
      presidentRaceData={presidentRaceData}
      races={races}
    />
  )
}
