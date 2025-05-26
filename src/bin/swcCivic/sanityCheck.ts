import { runBin } from '@/bin/runBin'
import xlsx from 'xlsx'

import usRandomAddresses from '../localCache/us_random_addresses.json'

import { getCongressionalDistrictFromAddress } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { getGooglePlaceIdFromAddress } from '@/utils/server/getGooglePlaceIdFromAddress'
import { getUSCongressionalDistrict } from '@/utils/server/swcCivic/getConstituencyQueries'
import { fetchReq } from '@/utils/shared/fetchReq'
import path from 'path'

interface Result {
  address: string
  placeId: string
  swc: string
  googleCivic: string
}

async function getResult(address: string): Promise<Result | undefined> {
  try {
    const placeId = await getGooglePlaceIdFromAddress(address)

    if (!placeId) {
      console.log('no placeId')
      return
    }

    const details = await fetchReq(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.GOOGLE_PLACES_BACKEND_API_KEY}`,
    )

    const detailsData = (await details.json()) as any

    const { geometry, formatted_address } = detailsData.result

    const { lat, lng } = geometry.location

    if (!lat || !lng) {
      console.log('no lat or lng')
      return
    }

    const [swcCivicData, googleCivicResult] = await Promise.all([
      getUSCongressionalDistrict({
        latitude: lat,
        longitude: lng,
      }),
      getCongressionalDistrictFromAddress(formatted_address),
    ])

    if ('notFoundReason' in googleCivicResult) {
      console.log('googleCivicResult.notFoundReason', googleCivicResult.notFoundReason)
      return
    }

    if (!swcCivicData) {
      console.log('no swcCivicData')
      return
    }

    const swcCivicResultString = `${swcCivicData.stateCode}-${swcCivicData.name}`
    const googleCivicResultString = `${googleCivicResult.stateCode}-${googleCivicResult.districtNumber}`

    if (!googleCivicResultString) {
      console.log('no googleCivicResultString')
      return
    }

    const result = {
      address: formatted_address,
      swc: swcCivicResultString,
      googleCivic: googleCivicResultString,
      different: swcCivicResultString !== googleCivicResultString ? 'yes' : 'no',
      placeId,
    }

    console.log(result)

    return result
  } catch (error) {
    console.log('catch', error)
    return
  }
}

function saveResults(results: Result[]) {
  const localCachePath = path.join(__dirname, '..', 'localCache')

  // Create a new workbook
  const workbook = xlsx.utils.book_new()

  // Convert results to worksheet
  const worksheet = xlsx.utils.json_to_sheet(results)

  // Add the worksheet to the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sanity Check Results')

  // Write the workbook to file
  xlsx.writeFile(workbook, path.join(localCachePath, 'swcCivicSanityCheck.xlsx'))
}

async function run() {
  const results: Result[] = []

  for (const address of usRandomAddresses) {
    const result = await getResult(address)
    if (result) {
      results.push(result)
    }
  }

  saveResults(results)
}

void runBin(run)
