import PageAllActionsDeeplink from '@/components/app/pageAllActionsDeeplink'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export default function GBUserActionCampaignsPage() {
  return <PageAllActionsDeeplink countryCode={SupportedCountryCodes.GB} />
}
