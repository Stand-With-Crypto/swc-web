import { Layout } from '@/components/app/pageLocalPolicy/common/statePage/layout'
import { LocalPolicyStatePageProps } from '@/components/app/pageLocalPolicy/common/statePage/types'
import { UsHeader } from '@/components/app/pageLocalPolicy/us/statePage/header'
import { UsPoliticiansSection } from '@/components/app/pageLocalPolicy/us/statePage/politiciansSection'
import { getAdvocatesCountByState } from '@/data/aggregations/getAdvocatesCountByState'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const stateNameResolver = getStateNameResolver(countryCode)

export async function UsLocalPolicyStatePage({
  politiciansData,
  stateCode,
}: LocalPolicyStatePageProps) {
  const initialTotalAdvocates = await getAdvocatesCountByState(stateCode)

  const stateName = stateNameResolver(stateCode.toUpperCase())

  return (
    <Layout>
      <UsHeader
        countryCode={countryCode}
        initialTotalAdvocates={initialTotalAdvocates.advocatesCount}
        stateCode={stateCode}
        stateName={stateName}
      />

      <UsPoliticiansSection
        countryCode={countryCode}
        highestScores={politiciansData.highestScores}
        lowestScores={politiciansData.lowestScores}
        stateCode={stateCode}
        stateName={stateName}
      />
    </Layout>
  )
}
