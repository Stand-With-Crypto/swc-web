import { Metadata } from 'next'

import { PageSimpleActions } from '@/components/app/pageSimpleActions'
import { SimpleActionsGroupName } from '@/components/app/pageSimpleActions/types'
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
    <PageSimpleActions
      campaignName={SimpleActionsGroupName.DAY_OF_ACTION_AUG_14_2025}
      countryCode={countryCode}
      subtitle="Thursday, August 14 will mark two years of Stand With Crypto advocates uniting to advance pro-crypto legislation that will make the United States into the Crypto Capital of the World. To commemorate this anniversary, the progress we’ve secured, and the work ahead, crypto advocates from across the country are uniting to participate in a Crypto Day of Action. Together, we are making sure crypto voters’ voices are being heard and encouraging lawmakers in Washington, D.C. to prioritize common-sense policies that will allow crypto to thrive long into the future."
      subtitleSize="md"
      title="Crypto Day of Action"
    />
  )
}
