import { persistJSONToStaticContentFolder, runBin } from '@/bin/binUtils'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { getLogger } from '@/utils/shared/logger'
import 'dotenv/config'

const logger = getLogger('fetchDTSISlugs')

async function fetchDTSISlugsForMocks() {
  logger.info(
    `fetching testing DTSI slugs and persisting to local DB for usage when generating mocks`,
  )
  // TODO uncomment after I figure out how to get `import 'server-only'` to work in bin scripts
  // const { people } = await queryDTSIAllPeople()
  // const slugs = people.map(person => person.slug)
  await persistJSONToStaticContentFolder('mocks/dtsiSlugs.json', [
    'sherrod---brown',
    'scott---fitzgerald',
    'marjorie---greene',
  ])
}

runBin(fetchDTSISlugsForMocks)
