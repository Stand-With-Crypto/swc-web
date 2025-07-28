import { Geometry } from 'geojson'
import { chunk } from 'lodash-es'

import { runBin } from '@/bin/runBin'
import { electoralZonesDataConfigs } from '@/bin/swcCivic/electoralZoneDataConfigs'
import { findMatchingAdministrativeAreaIndex } from '@/bin/swcCivic/utils/findMatchingAdministrativeAreaIndex'
import { getGeometryFromGISData } from '@/bin/swcCivic/utils/getGeometryFromGISData'
import { readGISData } from '@/bin/swcCivic/utils/readGISData'
import { electoralZones as ElectoralZones } from '@/data/prisma/generated/swc-civic'
import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

interface ElectoralZoneToUpdate {
  zoneName: string
  zoneCoordinates: Geometry
  administrativeArea?: string
  countryCode: string
}

function getCountriesToUpdateFromEnv() {
  const countriesToUpdate = process.env.COUNTRIES_TO_UPDATE?.split(',')

  if (!countriesToUpdate) {
    return ORDERED_SUPPORTED_COUNTRIES
  }

  return countriesToUpdate.map(countryCode => countryCode as SupportedCountryCodes)
}

/**
 * NOTE: Before running this script, make sure to compare the GIS data with DTSI data and audit if the normalization functions are correct.
 * To do this, run the following command:
 *
 * npm run ts src/bin/swcCivic/validations/compareGISDataWithDTSI.ts
 */
async function updateCountryElectoralZones() {
  const countriesToUpdate = getCountriesToUpdateFromEnv()

  for (const {
    countryCode,
    dataFilePath,
    electoralZoneNameField,
    normalizeElectoralZoneName,
    normalizeAdministrativeArea,
    administrativeAreaFieldPath,
    administrativeAreaFilePath,
  } of electoralZonesDataConfigs) {
    if (!countriesToUpdate.includes(countryCode)) {
      console.log(`Skipping ${countryCode} because it is not set to persist`)
      continue
    }

    console.log(`Reading GIS data for ${countryCode}...`)
    const GISData = await readGISData(dataFilePath)

    if (administrativeAreaFilePath) {
      console.log(`Reading administrative area GIS data`)
    }

    const administrativeAreaGISData = administrativeAreaFilePath
      ? await readGISData(administrativeAreaFilePath)
      : undefined

    if (!GISData) {
      console.error(`Error: No data returned from readGISData for ${countryCode}`)
      return
    }

    const administrativeAreaGeometries = administrativeAreaGISData
      ? administrativeAreaGISData.features.map(getGeometryFromGISData)
      : []

    console.log(`Normalizing ${GISData.features.length} electoral zones...\n\n`)
    const normalizedElectoralZonesOnGISDataMap = GISData.features.reduce(
      (acc, feature, index) => {
        if (index > 0 && index % 100 === 0) {
          console.log(`Normalized ${index} electoral zones...`)
        }

        const zoneName = feature.properties?.[electoralZoneNameField]

        const electoralZoneGeometry = getGeometryFromGISData(feature)

        let administrativeArea: ElectoralZoneToUpdate['administrativeArea']

        if (
          electoralZoneGeometry &&
          administrativeAreaGeometries.length > 0 &&
          administrativeAreaGISData &&
          administrativeAreaFieldPath
        ) {
          const administrativeAreaIndex = findMatchingAdministrativeAreaIndex(
            electoralZoneGeometry,
            administrativeAreaGeometries,
          )

          if (administrativeAreaIndex !== -1) {
            const matchingAdministrativeAreaGISData =
              administrativeAreaGISData.features[administrativeAreaIndex]

            if (matchingAdministrativeAreaGISData) {
              administrativeArea =
                matchingAdministrativeAreaGISData.properties?.[administrativeAreaFieldPath]
            }
          }
        } else if (administrativeAreaFieldPath) {
          administrativeArea = feature.properties?.[administrativeAreaFieldPath]
        }

        const normalizedAdministrativeArea = normalizeAdministrativeArea?.(administrativeArea)

        const normalizedZoneName = normalizeElectoralZoneName?.(zoneName) || zoneName

        const zoneCoordinates = feature.geometry

        if (!normalizedZoneName) {
          return acc
        }

        const electoralZoneKey = getElectoralZoneKey(
          normalizedZoneName,
          normalizedAdministrativeArea,
        )

        return {
          ...acc,
          [electoralZoneKey]: {
            zoneName: normalizedZoneName,
            zoneCoordinates,
            administrativeArea: normalizedAdministrativeArea,
            countryCode,
          },
        }
      },
      {} as Record<string, ElectoralZoneToUpdate>,
    )

    console.log(
      `Normalized ${Object.keys(normalizedElectoralZonesOnGISDataMap).length} electoral zones.`,
    )

    console.log('Updating the Database...')

    const currentElectoralZonesOnDatabase = await civicPrismaClient.electoralZones.findMany({
      where: {
        countryCode,
      },
    })

    const currentElectoralZonesOnDatabaseMap = currentElectoralZonesOnDatabase.reduce(
      (acc, electoralZone) => {
        const electoralZoneKey = getElectoralZoneKey(
          electoralZone.zoneName,
          electoralZone.administrativeArea,
        )

        return {
          ...acc,
          [electoralZoneKey]: electoralZone,
        }
      },
      {} as Record<string, ElectoralZones>,
    )

    await updateExistingElectoralZones(
      normalizedElectoralZonesOnGISDataMap,
      currentElectoralZonesOnDatabaseMap,
    )

    await deleteMissingElectoralZones(
      normalizedElectoralZonesOnGISDataMap,
      currentElectoralZonesOnDatabaseMap,
    )

    await createNewElectoralZones(
      normalizedElectoralZonesOnGISDataMap,
      currentElectoralZonesOnDatabaseMap,
    )
  }
}

async function updateExistingElectoralZones(
  normalizedElectoralZonesOnGISDataMap: Record<string, ElectoralZoneToUpdate>,
  currentElectoralZonesOnDatabaseMap: Record<string, ElectoralZones>,
) {
  console.log('\n\nUpdating existing electoral zones...')
  const electoralZonesToUpdate = Object.keys(normalizedElectoralZonesOnGISDataMap).filter(
    electoralZoneKey => currentElectoralZonesOnDatabaseMap[electoralZoneKey],
  )

  console.log(`Found ${electoralZonesToUpdate.length} electoral zones to update`)

  await chunkAndRun(electoralZonesToUpdate, 100, async electoralZoneKeyToUpdate => {
    const { zoneCoordinates, administrativeArea } =
      normalizedElectoralZonesOnGISDataMap[electoralZoneKeyToUpdate]

    const currentElectoralZone = currentElectoralZonesOnDatabaseMap[electoralZoneKeyToUpdate]

    console.log(`Updating electoral zone ${electoralZoneKeyToUpdate}...`)

    await civicPrismaClient.$executeRaw`
      UPDATE electoral_zones
        SET zone_coordinates = ST_Force3D(ST_GeomFromGeoJSON(${zoneCoordinates})), updated_at = now(), administrative_area = ${administrativeArea}
        WHERE id = ${currentElectoralZone.id}
    `
  })
}

async function deleteMissingElectoralZones(
  normalizedElectoralZonesOnGISDataMap: Record<string, ElectoralZoneToUpdate>,
  currentElectoralZonesOnDatabaseMap: Record<string, ElectoralZones>,
) {
  console.log('\n\nDeleting missing electoral zones...')
  const electoralZonesToDelete = Object.keys(currentElectoralZonesOnDatabaseMap).filter(
    electoralZoneKey => !normalizedElectoralZonesOnGISDataMap[electoralZoneKey],
  )

  console.log(`Found ${electoralZonesToDelete.length} electoral zones to delete`)

  for (const electoralZoneKeyToDelete of electoralZonesToDelete) {
    console.log(`Deleting electoral zone ${electoralZoneKeyToDelete}...`)
  }

  await civicPrismaClient.electoralZones.deleteMany({
    where: {
      id: {
        in: electoralZonesToDelete.map(
          electoralZoneKeyToDelete =>
            currentElectoralZonesOnDatabaseMap[electoralZoneKeyToDelete].id,
        ),
      },
    },
  })
}

async function createNewElectoralZones(
  normalizedElectoralZonesOnGISDataMap: Record<string, ElectoralZoneToUpdate>,
  currentElectoralZonesOnDatabaseMap: Record<string, ElectoralZones>,
) {
  console.log('\n\nCreating new electoral zones...')
  const electoralZonesToCreate = Object.keys(normalizedElectoralZonesOnGISDataMap).filter(
    electoralZoneKey => !currentElectoralZonesOnDatabaseMap[electoralZoneKey],
  )

  console.log(`Found ${electoralZonesToCreate.length} electoral zones to create`)

  await chunkAndRun(electoralZonesToCreate, 100, async electoralZoneKeyToCreate => {
    const { zoneName, zoneCoordinates, countryCode, administrativeArea } =
      normalizedElectoralZonesOnGISDataMap[electoralZoneKeyToCreate]

    console.log(`Creating electoral zone ${electoralZoneKeyToCreate}...`)

    await civicPrismaClient.$executeRaw`
        INSERT INTO electoral_zones (zone_name, administrative_area, country_code, zone_coordinates, created_at, updated_at)
        VALUES (${zoneName}, ${administrativeArea}, ${countryCode}, ST_Force3D(ST_GeomFromGeoJSON(${zoneCoordinates})), now(), now())
    `
  })
}

async function chunkAndRun<T>(items: T[], chunkSize: number, fn: (item: T) => Promise<void>) {
  const chunks = chunk(items, chunkSize)

  for (const _chunk of chunks) {
    await Promise.all(_chunk.map(fn))
  }
}

function getElectoralZoneKey(zoneName: string, administrativeArea?: string | null) {
  return administrativeArea ? `${zoneName}-${administrativeArea}` : zoneName
}

void runBin(updateCountryElectoralZones)
