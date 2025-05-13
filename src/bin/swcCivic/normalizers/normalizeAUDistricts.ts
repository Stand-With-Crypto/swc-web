/* cspell:disable */

import { runBin } from '@/bin/runBin'
import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'

const manuallyNormalizedAustraliaDistrictsOverrides: Record<string, string> = {
  'Eden-monaro': 'Eden-Monaro',
  Mcewen: 'McEwen',
  Mcmahon: 'McMahon',
  "O'connor": "O'Connor",
}

function normalizeAUDistrictName(name: string) {
  if (manuallyNormalizedAustraliaDistrictsOverrides[name]) {
    return manuallyNormalizedAustraliaDistrictsOverrides[name]
  }

  return name
}

async function normalizeAUDistricts() {
  const res = await civicPrismaClient.au_federal_electoral_district.findMany({
    select: {
      elect_div: true,
      ogc_fid: true,
    },
  })

  console.log(`Processing ${res.length} electoral districts...`)

  const updatedDistricts: (typeof res)[number][] = []

  for (const { elect_div: name, ogc_fid } of res) {
    if (!name) continue

    const normalizedName = normalizeAUDistrictName(name)

    if (normalizedName !== name) {
      console.log(`Updating district ${ogc_fid}: "${name}" -> "${normalizedName}"`)
      updatedDistricts.push({
        ogc_fid,
        elect_div: normalizedName,
      })
    }
  }

  console.log(`Found ${updatedDistricts.length} districts that need updating`)
  console.log(`Updating ${updatedDistricts.length} districts...`)

  for (const { ogc_fid, elect_div } of updatedDistricts) {
    await civicPrismaClient.au_federal_electoral_district.update({
      where: { ogc_fid },
      data: { elect_div },
    })
  }

  console.log('Finished updating electoral districts')
}

void runBin(normalizeAUDistricts)
