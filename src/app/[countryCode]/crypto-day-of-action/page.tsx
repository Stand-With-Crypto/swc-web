import { Metadata } from 'next'

import { PageSimpleCampaign } from '@/components/app/pageSimpleCampaign'
import { SimpleCampaignName } from '@/components/app/pageSimpleCampaign/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const dynamic = 'error'

const title = 'Crypto Day of Action'
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
      campaignName={SimpleCampaignName.DAY_OF_ACTION_AUG_14_2025}
      countryCode={countryCode}
      subtitle={description}
      title={title}
    />
  )
}
