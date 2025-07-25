import path from 'path'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { electoralZonesDataConfigs } from '@/bin/swcCivic/electoralZoneDataConfigs'
import { findMatchingAdministrativeAreaIndex } from '@/bin/swcCivic/utils/findMatchingAdministrativeAreaIndex'
import { getGeometryFromGISData } from '@/bin/swcCivic/utils/getGeometryFromGISData'
import { readGISData } from '@/bin/swcCivic/utils/readGISData'
import { queryDTSIDistrictsByCountryCode } from '@/data/dtsi/queries/queryDTSIDistrictsByCountryCode'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const DTSI_COUNTRIES_WITH_ADMINISTRATIVE_AREA = [SupportedCountryCodes.US]

async function compareGISDataWithDTSI() {
  const localCacheDir = path.join(__dirname, '..', 'localCache')
  const workbook = xlsx.utils.book_new()

  for (const {
    countryCode,
    dataFilePath,
    electoralZoneNameField,
    normalizeElectoralZoneName,
    administrativeAreaFilePath,
    normalizeAdministrativeArea,
    administrativeAreaFieldPath,
  } of electoralZonesDataConfigs) {
    console.log(`\nAnalyzing ${countryCode}...`)

    console.log(`Reading GIS data...`)

    const GISData = await readGISData(dataFilePath)

    if (!GISData) {
      console.error(`Error: No data returned from readGISData for ${countryCode}`)
      continue
    }

    if (administrativeAreaFilePath) {
      console.log(`Reading administrative area GIS data`)
    }

    const administrativeAreaGISData = administrativeAreaFilePath
      ? await readGISData(administrativeAreaFilePath)
      : undefined

    const administrativeAreaGeometries = administrativeAreaGISData
      ? administrativeAreaGISData.features.map(getGeometryFromGISData)
      : []

    const dtsiDistricts: string[] = []

    // Countries that districts are associated with a state. EX: US -> NY District 1
    if ([SupportedCountryCodes.US].includes(countryCode)) {
      for (const stateCode of Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)) {
        const dtsiResults = await queryDTSIDistrictsByCountryCode({
          countryCode,
          stateCode,
        })

        dtsiDistricts.push(
          ...dtsiResults.primaryDistricts.map(district => getElectoralZoneKey(district, stateCode)),
        )
      }
    } else {
      const dtsiResults = await queryDTSIDistrictsByCountryCode({
        countryCode,
      })

      dtsiDistricts.push(...dtsiResults.primaryDistricts)
    }

    // Convert both lists to Sets for efficient comparison
    // For electoral zones, we use the name field which is common across all types
    const electoralZoneSet = new Set(
      GISData.features
        .map(f => {
          const zoneName = f.properties?.[electoralZoneNameField]

          const electoralZoneGeometry = getGeometryFromGISData(f)

          let administrativeArea: string | undefined = undefined

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
            administrativeArea = f.properties?.[administrativeAreaFieldPath]
          }

          if (!zoneName) {
            return null
          }

          const normalizedZoneName = normalizeElectoralZoneName?.(zoneName) || zoneName

          if (administrativeArea && DTSI_COUNTRIES_WITH_ADMINISTRATIVE_AREA.includes(countryCode)) {
            const normalizedAdministrativeArea = normalizeAdministrativeArea?.(administrativeArea)
            return getElectoralZoneKey(normalizedZoneName, normalizedAdministrativeArea)
          }

          return normalizedZoneName
        })
        .filter(Boolean),
    )

    const dtsiSet = new Set(dtsiDistricts)

    const commonElements = [...electoralZoneSet].filter(name => name && dtsiSet.has(name))

    const onlyInElectoralZones = [...electoralZoneSet].filter(name => name && !dtsiSet.has(name))

    const onlyInDTSI = [...dtsiSet].filter(name => !electoralZoneSet.has(name))

    console.log(`Common elements: ${commonElements.length}`)
    console.log(`Only in GIS Data: ${onlyInElectoralZones.length}`)
    console.log(`Only in DTSI: ${onlyInDTSI.length}`)

    const maxLength = Math.max(onlyInElectoralZones.length, onlyInDTSI.length)
    const worksheetData = [
      ['Only in GIS Data', 'Only in DTSI'],
      ...Array.from({ length: maxLength }, (_, i) => [
        onlyInElectoralZones[i] || '',
        onlyInDTSI[i] || '',
      ]),
    ]

    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData)

    const worksheetName = countryCode.toUpperCase()

    xlsx.utils.book_append_sheet(workbook, worksheet, worksheetName)

    if (onlyInDTSI.length > 0) {
      console.log(`
    Please review the ${worksheetName} tab in the results file.
    All DTSI districts should be present in the civic database unless the district was abolished.
    If there are mismatches, please update the normalization functions to ensure that the GIS data is correctly mapped to the DTSI data.
      `)
    } else {
      console.log(`No differences found for ${worksheetName}`)
    }
  }

  const outputPath = path.join(localCacheDir, 'district-comparison.xlsx')
  xlsx.writeFile(workbook, outputPath)
  console.log(`\nResults written to: ${outputPath}`)
}

function getElectoralZoneKey(zoneName: string, administrativeArea?: string | null) {
  return administrativeArea ? `${zoneName}-${administrativeArea}` : zoneName
}

void runBin(compareGISDataWithDTSI)
