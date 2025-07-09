import { Geometry } from 'geojson'
import { chunk } from 'lodash-es'

import { runBin } from '@/bin/runBin'
import { electoralZonesDataConfigs } from '@/bin/swcCivic/electoralZoneDataConfigs'
import { readGISData } from '@/bin/swcCivic/utils/readGISData'
import { electoralZones as ElectoralZones } from '@/data/prisma/generated/swc-civic'
import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'

interface ElectoralZoneToUpdate {
  zoneName: string
  zoneCoordinates: Geometry
  stateCode?: string
  countryCode: string
}

/**
 * NOTE: Before running this script, make sure to compare the GIS data with DTSI data and audit if the normalization functions are correct.
 * To do this, run the following command:
 *
 * npm run ts src/bin/swcCivic/compareGISDataWithDTSI.ts
 */
async function updateCountryElectoralZones() {
  for (const {
    countryCode,
    dataFilePath,
    electoralZoneNameField,
    stateCodeField,
    normalizeElectoralZoneName,
    normalizeStateCode,
    persist,
  } of electoralZonesDataConfigs) {
    if (!persist) {
      console.log(`Skipping ${countryCode} because it is not set to persist`)
      continue
    }

    const GISData = await readGISData(dataFilePath)

    if (!GISData) {
      console.error(`Error: No data returned from readGISData for ${countryCode}`)
      return
    }

    const normalizedElectoralZonesOnGISDataMap = GISData.features.reduce(
      (acc, feature) => {
        const zoneName = feature.properties?.[electoralZoneNameField]
        const stateCode = stateCodeField ? feature.properties?.[stateCodeField] : undefined

        const normalizedZoneName = normalizeElectoralZoneName?.(zoneName) || zoneName
        const normalizedStateCode = stateCode
          ? normalizeStateCode?.(stateCode) || stateCode
          : undefined

        const zoneCoordinates = feature.geometry

        if (!normalizedZoneName) {
          return acc
        }

        const electoralZoneKey = getElectoralZoneKey(normalizedZoneName, normalizedStateCode)

        return {
          ...acc,
          [electoralZoneKey]: {
            zoneName: normalizedZoneName,
            zoneCoordinates,
            stateCode: normalizedStateCode,
            countryCode,
          },
        }
      },
      {} as Record<string, ElectoralZoneToUpdate>,
    )

    const currentElectoralZonesOnDatabase = await civicPrismaClient.electoralZones.findMany({
      where: {
        countryCode,
      },
    })

    const currentElectoralZonesOnDatabaseMap = currentElectoralZonesOnDatabase.reduce(
      (acc, electoralZone) => {
        const electoralZoneKey = getElectoralZoneKey(
          electoralZone.zoneName,
          electoralZone.stateCode,
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
    const { zoneCoordinates, stateCode } =
      normalizedElectoralZonesOnGISDataMap[electoralZoneKeyToUpdate]

    const currentElectoralZone = currentElectoralZonesOnDatabaseMap[electoralZoneKeyToUpdate]

    console.log(`Updating electoral zone ${electoralZoneKeyToUpdate}...`)

    await civicPrismaClient.$executeRaw`
      UPDATE electoral_zones
        SET zone_coordinates = ST_Force3D(ST_GeomFromGeoJSON(${zoneCoordinates})), state_code = ${stateCode}, updated_at = now() 
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
    const { zoneName, zoneCoordinates, stateCode, countryCode } =
      normalizedElectoralZonesOnGISDataMap[electoralZoneKeyToCreate]

    console.log(`Creating electoral zone ${electoralZoneKeyToCreate}...`)

    await civicPrismaClient.$executeRaw`
        INSERT INTO electoral_zones (zone_name, state_code, country_code, zone_coordinates, created_at, updated_at)
        VALUES (${zoneName}, ${stateCode}, ${countryCode}, ST_Force3D(ST_GeomFromGeoJSON(${zoneCoordinates})), now(), now())
    `
  })
}

async function chunkAndRun<T>(items: T[], chunkSize: number, fn: (item: T) => Promise<void>) {
  const chunks = chunk(items, chunkSize)

  for (const _chunk of chunks) {
    await Promise.all(_chunk.map(fn))
  }
}

function getElectoralZoneKey(zoneName: string, stateCode?: string | null) {
  return stateCode ? `${zoneName}-${stateCode}` : zoneName
}

void runBin(updateCountryElectoralZones)
