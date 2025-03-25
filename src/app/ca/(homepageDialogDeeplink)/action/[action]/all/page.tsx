import PageAllActionsDeeplink from '@/components/app/pageAllActionsDeeplink'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export default function CAUserActionCampaignsPage() {
  return <PageAllActionsDeeplink countryCode={SupportedCountryCodes.CA} />
}
