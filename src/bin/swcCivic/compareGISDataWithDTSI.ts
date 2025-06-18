import path from 'path'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { readGISData } from '@/bin/swcCivic/utils/readGISData'
import { queryDTSIDistrictsByCountryCode } from '@/data/dtsi/queries/queryDTSIDistrictsByCountryCode'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { electoralZonesDataConfigs } from './electoralZoneDataConfigs'

async function compareGISDataWithDTSI() {
  const localCacheDir = path.join(__dirname, '..', 'localCache')
  const workbook = xlsx.utils.book_new()

  for (const {
    countryCode,
    dataFilePath,
    electoralZoneNameField,
    normalizeElectoralZoneName,
    normalizeStateCode,
    stateCodeField,
  } of electoralZonesDataConfigs) {
    console.log(`\nAnalyzing ${countryCode}...`)

    const GISData = await readGISData(dataFilePath)

    if (!GISData) {
      console.error(`Error: No data returned from readGISData for ${countryCode}`)
      continue
    }

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
          const stateCode = stateCodeField ? f.properties?.[stateCodeField] : undefined

          if (!zoneName) {
            return null
          }

          const normalizedZoneName = normalizeElectoralZoneName?.(zoneName) || zoneName

          if (stateCode) {
            const normalizedStateCode = normalizeStateCode?.(stateCode) || stateCode
            return getElectoralZoneKey(normalizedZoneName, normalizedStateCode)
          }

          return normalizedZoneName
        })
        .filter(Boolean),
    )
    // For DTSI results, we use the primaryDistricts array
    const dtsiSet = new Set(dtsiDistricts.sort((a, b) => a.localeCompare(b)) || [])

    // Find common elements
    const commonElements = [...electoralZoneSet].filter(name => name && dtsiSet.has(name))

    // Find elements only in electoral zones
    const onlyInElectoralZones = [...electoralZoneSet].filter(name => name && !dtsiSet.has(name))

    // Find elements only in dtsiResults
    const onlyInDTSI = [...dtsiSet].filter(name => !electoralZoneSet.has(name))

    console.log(`Common elements: ${commonElements.length}`)
    console.log(`Only in GIS Data: ${onlyInElectoralZones.length}`)
    console.log(`Only in DTSI: ${onlyInDTSI.length}`)

    // Create worksheet data
    const maxLength = Math.max(onlyInElectoralZones.length, onlyInDTSI.length)
    const worksheetData = [
      ['Only in GIS Data', 'Only in DTSI'], // Header row
      ...Array.from({ length: maxLength }, (_, i) => [
        onlyInElectoralZones[i] || '', // Empty string if no more items
        onlyInDTSI[i] || '',
      ]),
    ]

    // Create worksheet
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData)

    const worksheetName = countryCode.toUpperCase()

    // Add worksheet to workbook
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

  // Write workbook to file
  const outputPath = path.join(localCacheDir, 'district-comparison.xlsx')
  xlsx.writeFile(workbook, outputPath)
  console.log(`\nResults written to: ${outputPath}`)
}

function getElectoralZoneKey(zoneName: string, stateCode?: string | null) {
  return stateCode ? `${zoneName}-${stateCode}` : zoneName
}

void runBin(compareGISDataWithDTSI)
