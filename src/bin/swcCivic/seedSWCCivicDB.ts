import fs from 'fs'
import { chunk } from 'lodash-es'

import { runBin } from '@/bin/runBin'
import { electoralZonesDataConfigs } from '@/bin/swcCivic/electoralZoneDataConfigs'
import { readGISData } from '@/bin/swcCivic/utils/readGISData'
import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'

/**
 * NOTE: Before running this script, make sure to compare the GIS data with DTSI data and audit if the normalization functions are correct.
 * To do this, run the following command:
 *
 * npm run ts src/bin/swcCivic/compareGISDataWithDTSI.ts
 */
async function seedSWCCivicDB() {
  console.log('Starting SWC Civic database seeding process...')

  for (const { dataFilePath } of electoralZonesDataConfigs) {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`\nError: File ${dataFilePath} does not exist`)
      return
    }
  }

  for (const {
    countryCode,
    dataFilePath,
    electoralZoneNameField,
    stateCodeField,
    normalizeElectoralZoneName,
    normalizeStateCode,
    persist,
  } of electoralZonesDataConfigs) {
    console.log(`\nProcessing country: ${countryCode}`)
    console.log(`Reading data from: ${dataFilePath}`)

    try {
      const GISData = await readGISData(dataFilePath)

      if (!GISData) {
        console.error(`Error: No data returned from readGISData for ${countryCode}`)
        continue
      }

      console.log(`Found ${GISData.features.length} electoral zones for ${countryCode}`)

      let processedCount = 0

      const electoralZoneChunks = chunk(GISData.features, 100)

      for (const electoralZoneChunk of electoralZoneChunks) {
        await Promise.all(
          electoralZoneChunk.map(async electoralZone => {
            const electoralZoneName = electoralZone.properties?.[electoralZoneNameField]?.trim()
            const stateCode = stateCodeField
              ? electoralZone.properties?.[stateCodeField]
              : undefined

            const normalizedElectoralZoneName =
              normalizeElectoralZoneName?.(electoralZoneName) || electoralZoneName

            const normalizedStateCode = stateCode
              ? normalizeStateCode?.(stateCode) || stateCode
              : undefined

            const geometry = electoralZone.geometry

            try {
              if (persist) {
                await civicPrismaClient.$executeRaw`
              INSERT INTO electoral_zones (zone_name, state_code, country_code, zone_coordinates, created_at, updated_at)
              VALUES (${normalizedElectoralZoneName}, ${normalizedStateCode}, ${countryCode}, ST_Force3D(ST_GeomFromGeoJSON(${geometry})), now(), now())
              `
              } else {
                console.log(
                  `Would have inserted electoral zone ${normalizedElectoralZoneName} for ${countryCode}`,
                )
              }

              processedCount++

              if (processedCount % 100 === 0) {
                console.log(
                  `Processed ${processedCount}/${GISData.features.length} electoral zones for ${countryCode}`,
                )
              }
            } catch (error) {
              console.error(
                `Error inserting electoral zone ${normalizedElectoralZoneName} for ${countryCode}:`,
                error,
              )
            }
          }),
        )
      }

      console.log(`Completed processing ${processedCount} electoral zones for ${countryCode}`)
    } catch (error) {
      console.error(`Error processing country ${countryCode}:`, error)
    }
  }

  console.log('\nSWC Civic database seeding process completed.')
}

void runBin(seedSWCCivicDB)
