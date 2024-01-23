import { persistJSONToStaticContentFolder, runBin } from '@/bin/binUtils'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('fetchDTSISlugs')

async function fetchDTSISlugsForMocks() {
  logger.info(
    `fetching testing DTSI slugs and persisting to local DB for usage when generating mocks`,
  )
  const { people } = await queryDTSIAllPeople()
  const slugs = people.map(person => person.slug)
  await persistJSONToStaticContentFolder('mocks/dtsiSlugs.json', slugs)
}

runBin(fetchDTSISlugsForMocks)
