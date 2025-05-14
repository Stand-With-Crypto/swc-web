/* cspell:disable */

import { runBin } from '@/bin/runBin'
import { civicPrismaClient } from '@/utils/server/swcCivic/civicPrismaClient'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

const US_STATE_NUMBER_TO_STATE_CODE: Record<number, USStateCode> = {
  1: 'AL',
  2: 'AK',
  4: 'AZ',
  5: 'AR',
  6: 'CA',
  8: 'CO',
  9: 'CT',
  10: 'DE',
  11: 'DC',
  12: 'FL',
  13: 'GA',
  15: 'HI',
  16: 'ID',
  17: 'IL',
  18: 'IN',
  19: 'IA',
  20: 'KS',
  21: 'KY',
  22: 'LA',
  23: 'ME',
  24: 'MD',
  25: 'MA',
  26: 'MI',
  27: 'MN',
  28: 'MS',
  29: 'MO',
  30: 'MT',
  31: 'NE',
  32: 'NV',
  33: 'NH',
  34: 'NJ',
  35: 'NM',
  36: 'NY',
  37: 'NC',
  38: 'ND',
  39: 'OH',
  40: 'OK',
  41: 'OR',
  42: 'PA',
  44: 'RI',
  45: 'SC',
  46: 'SD',
  47: 'TN',
  48: 'TX',
  49: 'UT',
  50: 'VT',
  51: 'VA',
  53: 'WA',
  54: 'WV',
  55: 'WI',
  56: 'WY',
}

function normalizeUSDistrictName(name: string) {
  if (name === 'Congressional District (at Large)') {
    return 'At-Large'
  }

  const match = name.match(/(\d+)/)

  if (match) {
    return match[0]
  }

  return name
}

async function normalizeUSDistricts() {
  const res = await civicPrismaClient.us_congressional_district.findMany({
    select: {
      namelsad: true,
      ogc_fid: true,
      statefp: true,
    },
  })

  console.log(`Processing ${res.length} electoral districts...`)

  const updatedDistricts: (typeof res)[number][] = []

  for (const { namelsad: name, statefp, ogc_fid } of res) {
    if (!name) continue

    const normalizedName = normalizeUSDistrictName(name)
    const normalizedStateCode = US_STATE_NUMBER_TO_STATE_CODE[Number(statefp)]

    if (normalizedName !== name || normalizedStateCode !== statefp) {
      console.log(
        `Updating district ${ogc_fid}: "${name}" -> "${normalizedName}" (${normalizedStateCode})`,
      )
      updatedDistricts.push({
        ogc_fid,
        namelsad: normalizedName,
        statefp: normalizedStateCode,
      })
    }
  }

  console.log(`Found ${updatedDistricts.length} districts that need updating`)
  console.log(`Updating ${updatedDistricts.length} districts...`)

  for (const district of updatedDistricts) {
    await civicPrismaClient.us_congressional_district.update({
      where: { ogc_fid: district.ogc_fid },
      data: district,
    })
  }

  console.log('Finished updating electoral districts')
}

void runBin(normalizeUSDistricts)
