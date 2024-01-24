process.env.USE_DTSI_PRODUCTION_API_ON_LOCAL = 'true'
import { runBin } from '@/bin/runBin'
import { persistJSONToStaticContentFolder } from '@/bin/utils/persistJSONToStaticContentFolder'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('fetchDTSISlugs')

async function fetchDTSISlugs() {
  logger.info(
    `fetching testing DTSI slugs and persisting to local DB for usage when generating mocks`,
  )
  const { people } = await queryDTSIAllPeople()
  const slugs = people.map(person => person.slug).sort()
  await persistJSONToStaticContentFolder('dtsi/dtsiSlugs.json', slugs)
}

runBin(fetchDTSISlugs)
