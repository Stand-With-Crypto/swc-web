import { Layout } from '@/components/app/pageLocalPolicy/common/statePage/layout'
import { LocalPolicyStatePageProps } from '@/components/app/pageLocalPolicy/common/statePage/types'
import { UsDistrictLeaderboardSection } from '@/components/app/pageLocalPolicy/us/statePage/districtLeaderboardSection'
import { UsHeader } from '@/components/app/pageLocalPolicy/us/statePage/header'
import { UsPoliticiansSection } from '@/components/app/pageLocalPolicy/us/statePage/politiciansSection'
import { UsRecentActivitySection } from '@/components/app/pageLocalPolicy/us/statePage/recentActivitySection'
import { UsStateListSection } from '@/components/app/pageLocalPolicy/us/statePage/stateListSection'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const stateNameResolver = getStateNameResolver(countryCode)

export async function UsLocalPolicyStatePage({
  initialTotalAdvocates,
  politiciansData,
  stateCode,
}: LocalPolicyStatePageProps) {
  const stateName = stateNameResolver(stateCode.toUpperCase())

  return (
    <Layout>
      <UsHeader
        initialTotalAdvocates={initialTotalAdvocates.advocatesCount}
        stateCode={stateCode}
        stateName={stateName}
      />

      <UsPoliticiansSection
        highestScores={politiciansData.highestScores}
        lowestScores={politiciansData.lowestScores}
        stateCode={stateCode}
        stateName={stateName}
      />

      <UsRecentActivitySection stateCode={stateCode} stateName={stateName} />

      <UsDistrictLeaderboardSection stateCode={stateCode} stateName={stateName} />

      <UsStateListSection stateCode={stateCode.toUpperCase()} />
    </Layout>
  )
}
