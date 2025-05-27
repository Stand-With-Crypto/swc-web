/* cspell:disable */

import path from 'path'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { queryDTSIDistrictsByCountryCode } from '@/data/dtsi/queries/queryDTSIDistrictsByCountryCode'
import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

async function compareDatabaseDistrictsWithDTSI() {
  const localCacheDir = path.join(__dirname, '..', 'localCache')
  const workbook = xlsx.utils.book_new()

  for (const countryCode of ORDERED_SUPPORTED_COUNTRIES) {
    console.log(`\nAnalyzing ${countryCode}...`)
    const constituencies = await civicPrismaClient.constituencies.findMany({
      where: {
        countryCode,
      },
      select: {
        name: true,
      },
    })
    const dtsiResults = await queryDTSIDistrictsByCountryCode({
      countryCode,
    })

    // Convert both lists to Sets for efficient comparison
    // For constituencies, we use the name field which is common across all types
    const constituencySet = new Set(constituencies.map(c => c.name))
    // For DTSI results, we use the primaryDistricts array
    const dtsiSet = new Set(dtsiResults.primaryDistricts.sort((a, b) => a.localeCompare(b)) || [])

    // Find common elements
    const commonElements = [...constituencySet].filter(name => name && dtsiSet.has(name))

    // Find elements only in constituencies
    const onlyInConstituencies = [...constituencySet].filter(name => name && !dtsiSet.has(name))

    // Find elements only in dtsiResults
    const onlyInDTSI = [...dtsiSet].filter(name => !constituencySet.has(name))

    console.log(`Common elements: ${commonElements.length}`)
    console.log(`Only in constituencies: ${onlyInConstituencies.length}`)
    console.log(`Only in DTSI: ${onlyInDTSI.length}`)

    // Create worksheet data
    const maxLength = Math.max(onlyInConstituencies.length, onlyInDTSI.length)
    const worksheetData = [
      ['Only in Database', 'Only in DTSI'], // Header row
      ...Array.from({ length: maxLength }, (_, i) => [
        onlyInConstituencies[i] || '', // Empty string if no more items
        onlyInDTSI[i] || '',
      ]),
    ]

    // Create worksheet
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData)

    const worksheetName = countryCode.toUpperCase()

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, worksheetName)

    if (onlyInDTSI.length > 0) {
      console.log(
        `Please review the ${worksheetName} tab in the results file. All DTSI districts should be present in the civic database.`,
      )
    } else {
      console.log(`No differences found for ${worksheetName}`)
    }
  }

  // Write workbook to file
  const outputPath = path.join(localCacheDir, 'district-comparison.xlsx')
  xlsx.writeFile(workbook, outputPath)
  console.log(`\nResults written to: ${outputPath}`)
}

void runBin(compareDatabaseDistrictsWithDTSI)
