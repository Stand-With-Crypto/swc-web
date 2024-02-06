import { runBin } from '@/bin/runBin'
import { persistJSONToStaticContentFolder } from '@/bin/utils/persistJSONToStaticContentFolder'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('fetchDTSISlugs')

async function fetchDTSISlugs() {
  logger.info(
    `fetching testing DTSI slugs and persisting to local JSON file for usage when generating mocks`,
  )
  const { people } = await queryDTSIAllPeople()
  const slugs = people.map(person => person.slug).sort()
  await persistJSONToStaticContentFolder('dtsi/testingDtsiSlugs.json', slugs)
}

runBin(fetchDTSISlugs)
