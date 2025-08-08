import { SimpleCampaignGrid } from '@/components/app/pageSimpleCampaign/grid'
import { SimpleCampaignName } from '@/components/app/pageSimpleCampaign/types'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PageSimpleCampaignProps {
  title: string
  subtitle: string
  campaignName: SimpleCampaignName
  countryCode: SupportedCountryCodes
}

export function PageSimpleCampaign({
  title,
  subtitle,
  campaignName,
  countryCode,
}: PageSimpleCampaignProps) {
  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <div className="space-y-4">
        <PageTitle size="xl">{title}</PageTitle>
        <PageSubTitle size="lg">{subtitle}</PageSubTitle>
      </div>

      <SimpleCampaignGrid campaignName={campaignName} countryCode={countryCode} />
    </div>
  )
}
