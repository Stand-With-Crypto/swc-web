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

const constituencyData = [
  {
    countryCode: SupportedCountryCodes.GB,
    dataFilePath: 'data/uk_parliamentary_constituencies.geojson',
    constituencyNameField: 'PCON24NM',
    persist: true,
  },
  {
    countryCode: SupportedCountryCodes.US,
    dataFilePath: 'data/us_congressional_districts.geojson',
    constituencyNameField: 'NAMELSAD',
    stateCodeField: 'STATEFP',
    normalizeConstituency: normalizeUSDistrictName,
    normalizeStateCode: normalizeUSStateCode,
    persist: true,
  },
  {
    countryCode: SupportedCountryCodes.CA,
    dataFilePath: 'data/FED_CA_2023_EN.kmz',
    constituencyNameField: 'Name',
    normalizeConstituency: normalizeCADistrictName,
    persist: true,
  },
  {
    countryCode: SupportedCountryCodes.AU,
    dataFilePath: 'data/au/2021_ELB_region.shp',
    constituencyNameField: 'Elect_div',
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
    constituencyNameField,
    stateCodeField,
    normalizeConstituency,
    normalizeStateCode,
    persist,
  } of constituencyData) {
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
      console.log(`Found ${geojsonData.features.length} constituencies for ${countryCode}`)

      let processedCount = 0
      for (const feature of geojsonData.features) {
        const constituencyName = feature.properties?.[constituencyNameField]?.trim()
        const stateCode = stateCodeField ? feature.properties?.[stateCodeField] : undefined

        const normalizedConstituencyName =
          normalizeConstituency?.(constituencyName) || constituencyName

        const normalizedStateCode = stateCode
          ? normalizeStateCode?.(stateCode) || stateCode
          : undefined

        const geometry = feature.geometry

        try {
          if (persist) {
            await civicPrismaClient.$executeRaw`
            INSERT INTO constituencies (name, state_code, country_code, wkb_geometry)
            VALUES (${normalizedConstituencyName}, ${normalizedStateCode}, ${countryCode}, ST_Force3D(ST_GeomFromGeoJSON(${geometry})))
            `
          } else {
            console.log(
              `Would have inserted constituency ${normalizedConstituencyName} for ${countryCode}`,
            )
          }

          processedCount++

          if (processedCount % 100 === 0) {
            console.log(
              `Processed ${processedCount}/${geojsonData.features.length} constituencies for ${countryCode}`,
            )
          }
        } catch (error) {
          console.error(
            `Error inserting constituency ${normalizedConstituencyName} for ${countryCode}:`,
            error,
          )
        }
      }

      console.log(`Completed processing ${processedCount} constituencies for ${countryCode}`)
    } catch (error) {
      console.error(`Error processing country ${countryCode}:`, error)
    }
  }

  console.log('\nSWC Civic database seeding process completed.')
}

void runBin(seedSWCCivicDB)
