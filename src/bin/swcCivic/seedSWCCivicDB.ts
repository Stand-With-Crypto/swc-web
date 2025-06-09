import { Feature, Geometry } from 'geojson'
import { ogr2ogr } from 'ogr2ogr'

import { runBin } from '@/bin/runBin'
import { normalizeCADistrictName } from '@/bin/swcCivic/normalizers/normalizeCADistricts'
import {
  normalizeUSDistrictName,
  normalizeUSStateCode,
} from '@/bin/swcCivic/normalizers/normalizeUSDistrict'
import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const electoralZonesData = [
  {
    countryCode: SupportedCountryCodes.GB,
    dataFilePath: 'data/uk_parliamentary_constituencies.geojson',
    electoralZoneNameField: 'PCON24NM',
    persist: true,
  },
  {
    countryCode: SupportedCountryCodes.US,
    dataFilePath: 'data/us_congressional_districts.geojson',
    electoralZoneNameField: 'NAMELSAD',
    stateCodeField: 'STATEFP',
    normalizeElectoralZoneName: normalizeUSDistrictName,
    normalizeStateCode: normalizeUSStateCode,
    persist: true,
  },
  {
    countryCode: SupportedCountryCodes.CA,
    dataFilePath: 'data/FED_CA_2023_EN.kmz',
    electoralZoneNameField: 'Name',
    normalizeElectoralZoneName: normalizeCADistrictName,
    persist: true,
  },
  {
    countryCode: SupportedCountryCodes.AU,
    dataFilePath: 'data/au/2021_ELB_region.shp',
    electoralZoneNameField: 'Elect_div',
    persist: true,
  },
]

interface GeoJSONData {
  type: string
  features: Feature<Geometry, { [key: string]: string }>[]
}

async function seedSWCCivicDB() {
  console.log('Starting SWC Civic database seeding process...')

  for (const {
    countryCode,
    dataFilePath,
    electoralZoneNameField,
    stateCodeField,
    normalizeElectoralZoneName,
    normalizeStateCode,
    persist,
  } of electoralZonesData) {
    console.log(`\nProcessing country: ${countryCode}`)
    console.log(`Reading data from: ${dataFilePath}`)

    try {
      const { data } = await ogr2ogr(dataFilePath, {
        maxBuffer: 1024 * 1024 * 400, // 400MB
      })

      if (!data) {
        console.error(`Error: No data returned from ogr2ogr for ${countryCode}`)
        continue
      }

      const geojsonData = data as unknown as GeoJSONData
      console.log(`Found ${geojsonData.features.length} electoral zones for ${countryCode}`)

      let processedCount = 0
      for (const feature of geojsonData.features) {
        const electoralZoneName = feature.properties?.[electoralZoneNameField]?.trim()
        const stateCode = stateCodeField ? feature.properties?.[stateCodeField] : undefined

        const normalizedElectoralZoneName =
          normalizeElectoralZoneName?.(electoralZoneName) || electoralZoneName

        const normalizedStateCode = stateCode
          ? normalizeStateCode?.(stateCode) || stateCode
          : undefined

        const geometry = feature.geometry

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
              `Processed ${processedCount}/${geojsonData.features.length} electoral zones for ${countryCode}`,
            )
          }
        } catch (error) {
          console.error(
            `Error inserting electoral zone ${normalizedElectoralZoneName} for ${countryCode}:`,
            error,
          )
        }
      }

      console.log(`Completed processing ${processedCount} electoral zones for ${countryCode}`)
    } catch (error) {
      console.error(`Error processing country ${countryCode}:`, error)
    }
  }

  console.log('\nSWC Civic database seeding process completed.')
}

void runBin(seedSWCCivicDB)
