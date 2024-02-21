import { runBin } from '@/bin/runBin'
import { fetchWithLocalCache } from '@/bin/utils/fetchWithLocalCache'
import { persistJSONToStaticContentFolder } from '@/bin/utils/persistJSONToStaticContentFolder'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import legacyPoliticianSlugs from '@/staticContent/dtsi/legacyPoliticianSlugs.json'
import _manuallyModifiedLegacyPoliticianToDTSIMap from '@/staticContent/dtsi/manuallyModifiedLegacyPoliticianToDTSIMap.json'
import { getLogger } from '@/utils/shared/logger'

process.env.USE_DTSI_PRODUCTION_API = 'true'

const logger = getLogger('dtsi/generateLegacySlugsToNewSlugsMap')
const manuallyModifiedLegacyPoliticianToDTSIMap: Record<string, string> =
  _manuallyModifiedLegacyPoliticianToDTSIMap
function replaceFirst(string: string, find: string, replace: string) {
  const index = string.indexOf(find)
  if (index > -1) {
    return string.substring(0, index) + replace + string.substring(index + find.length)
  }
  return string
}

async function generateLegacySlugsToNewSlugsMap() {
  logger.info(`${legacyPoliticianSlugs.length} legacy politician slugs`)

  // fetch DTSI info
  const { people } = await fetchWithLocalCache({
    datetimeExpires: new Date('2024-02-01'),
    fetchFn: () => queryDTSIAllPeople(),
    fileName: 'matchLegacySlugsToNewSlugsDTSIQuery.json',
  })
  logger.info(`${people.length} DTSI people`)

  // match DTSI info to legacy slugs
  const legacyPoliticianSlugWithDTSISlug = legacyPoliticianSlugs.map(legacyPoliticianSlug => {
    const reformatted = replaceFirst(legacyPoliticianSlug, '-', '---').replace(/[^a-zA-Z0-9-]/g, '')
    const matches = people.filter(person => {
      if (person.slug === manuallyModifiedLegacyPoliticianToDTSIMap[legacyPoliticianSlug]) {
        return true
      }
      if (person.slug === reformatted) {
        return true
      }
      if (`${person.firstNickname}---${person.lastName}`.toLocaleLowerCase() === reformatted) {
        return true
      }
    })
    if (matches.length > 1) {
      logger.info(
        `got ${matches.length} matches for ${legacyPoliticianSlug}: ${matches
          .map(match => match.slug)
          .join(', ')}`,
      )
      return { legacyPoliticianSlug, dtsiSlug: undefined }
    }
    return { legacyPoliticianSlug, dtsiSlug: matches[0]?.slug }
  })

  const unmatchedLegacyPoliticianSlugs = legacyPoliticianSlugWithDTSISlug
    .filter(({ dtsiSlug }) => !dtsiSlug)
    .map(({ legacyPoliticianSlug }) => legacyPoliticianSlug)
  logger.info(`${unmatchedLegacyPoliticianSlugs.length} unmatched legacy politician slugs`)
  if (unmatchedLegacyPoliticianSlugs.length) {
    logger.info(JSON.stringify(unmatchedLegacyPoliticianSlugs, null, 4))
    throw new Error('unmatched legacy politician slugs, stopping here until fixed')
  }
  logger.info(`writing results to JSON`)
  await persistJSONToStaticContentFolder(
    'dtsi/legacyPoliticianToDTSIMap.json',
    legacyPoliticianSlugWithDTSISlug.reduce(
      (accum, { legacyPoliticianSlug, dtsiSlug }) => {
        accum[legacyPoliticianSlug] = dtsiSlug!
        return accum
      },
      {} as Record<string, string>,
    ),
  )
}

runBin(generateLegacySlugsToNewSlugsMap)
