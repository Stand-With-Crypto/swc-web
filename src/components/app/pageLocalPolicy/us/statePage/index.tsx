import { Layout } from '@/components/app/pageLocalPolicy/common/statePage/layout'
import { LocalPolicyStatePageProps } from '@/components/app/pageLocalPolicy/common/statePage/types'
import { UsHeader } from '@/components/app/pageLocalPolicy/us/statePage/header'
import { UsPoliticiansSection } from '@/components/app/pageLocalPolicy/us/statePage/politiciansSection'
import { UsReferralLeaderboardSection } from '@/components/app/pageLocalPolicy/us/statePage/referralLeaderboardSection'
import { UsStateListSection } from '@/components/app/pageLocalPolicy/us/statePage/stateListSection'
import { getAdvocatesCountByState } from '@/data/aggregations/getAdvocatesCountByState'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

export async function UsLocalPolicyStatePage({ stateCode }: LocalPolicyStatePageProps) {
  const initialTotalAdvocates = await getAdvocatesCountByState(stateCode)

  const stateNameResolver = getStateNameResolver(countryCode)
  const stateName = stateNameResolver(stateCode.toUpperCase())

  return (
    <Layout>
      <UsHeader
        countryCode={countryCode}
        initialTotalAdvocates={initialTotalAdvocates.advocatesCount}
        stateCode={stateCode}
        stateName={stateName}
      />

      <UsPoliticiansSection countryCode={countryCode} stateCode={stateCode} stateName={stateName} />

      <UsReferralLeaderboardSection
        countryCode={countryCode}
        stateCode={stateCode}
        stateName={stateName}
        urls={urls}
      />

      <UsStateListSection
        stateCode={stateCode.toUpperCase()}
        states={US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP}
        urls={urls}
      />
    </Layout>
  )
}
