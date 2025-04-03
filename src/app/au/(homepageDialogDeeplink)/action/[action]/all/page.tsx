import PageAllActionsDeeplink from '@/components/app/pageAllActionsDeeplink'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export default function AUUserActionCampaignsPage() {
  return <PageAllActionsDeeplink countryCode={SupportedCountryCodes.AU} />
}
