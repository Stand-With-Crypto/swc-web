import { Metadata } from 'next'

import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { PageSimpleCampaign } from '@/components/app/pageSimpleCampaign'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SimpleCampaignName } from '@/components/app/pageSimpleCampaign/types'

export const dynamic = 'error'

const title = 'Crypto day of action'
const description = 'Your actions will make a big difference.'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

const countryCode = SupportedCountryCodes.US as const

export default function DayOfActionPageRoot() {
  return (
    <PageSimpleCampaign
      campaign={SimpleCampaignName.DAY_OF_ACTION_AUG_14_2025}
      countryCode={countryCode}
      title={title}
      subtitle={description}
    />
  )
}
