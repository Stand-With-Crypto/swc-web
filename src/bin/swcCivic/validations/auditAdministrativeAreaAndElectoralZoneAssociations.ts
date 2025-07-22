import { runBin } from '@/bin/runBin'
import { readGISData } from '@/bin/swcCivic/utils/readGISData'
import { getGeometryFromGISData } from '@/bin/swcCivic/utils/getGeometryFromGISData'
import { electoralZonesDataConfigs } from '@/bin/swcCivic/electoralZoneDataConfigs'
import { findMatchingAdministrativeAreaIndex } from '@/bin/swcCivic/utils/findMatchingAdministrativeAreaIndex'

async function auditAdministrativeAreaAndElectoralZoneAssociations() {
  for (const {
    dataFilePath,
    administrativeAreaFilePath,
    electoralZoneNameField,
    administrativeAreaFieldPath,
    countryCode,
  } of electoralZonesDataConfigs) {
    if (!administrativeAreaFilePath || !administrativeAreaFieldPath) continue

    console.log(`Auditing ${countryCode}...`)

    console.log(`Reading GIS data...`)

    const [electoralZonesGISData, administrativeAreaGISData] = await Promise.all([
      readGISData(dataFilePath),
      readGISData(administrativeAreaFilePath),
    ])

    if (!electoralZonesGISData || !administrativeAreaGISData) {
      console.error(`Error: No data returned from readGISData for ${countryCode}`)
      continue
    }

    const administrativeAreaGeometries =
      administrativeAreaGISData.features.map(getGeometryFromGISData)

    let matchCount = 0
    let noMatchCount = 0

    for (const feature of electoralZonesGISData.features) {
      const electoralZoneGeometry = getGeometryFromGISData(feature)
      const electoralZoneName = feature.properties?.[electoralZoneNameField]

      if (!electoralZoneGeometry) {
        console.error(`Error: No geometry returned from getGeometryFromGISData for ${countryCode}`)
        continue
      }

      const matchIndex = findMatchingAdministrativeAreaIndex(
        electoralZoneGeometry,
        administrativeAreaGeometries,
      )

      if (matchIndex === -1) {
        console.log(`❌ ${electoralZoneName} is not associated with any administrative area`)
        noMatchCount++
      } else {
        const administrativeAreaName =
          administrativeAreaGISData.features[matchIndex].properties?.[administrativeAreaFieldPath]

        console.log(
          `✅ ${electoralZoneName} is associated with administrative area ${administrativeAreaName}`,
        )
        matchCount++
      }
    }

    console.log(`\n${matchCount} matches found`)
    console.log(`${noMatchCount} no matches found`)
  }
}

void runBin(auditAdministrativeAreaAndElectoralZoneAssociations)
