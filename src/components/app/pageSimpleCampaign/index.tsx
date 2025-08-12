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
  titleSize?: 'lg' | 'md' | 'sm' | 'xl' | 'xs' | 'xxs'
  subtitleSize?: 'lg' | 'md' | 'sm' | 'xl' | '2xl'
}

export function PageSimpleCampaign({
  title,
  subtitle,
  campaignName,
  countryCode,
  subtitleSize = 'lg',
  titleSize = 'xl',
}: PageSimpleCampaignProps) {
  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <div className="space-y-4">
        <PageTitle size={titleSize}>{title}</PageTitle>
        <PageSubTitle size={subtitleSize}>{subtitle}</PageSubTitle>
      </div>

      <SimpleCampaignGrid campaignName={campaignName} countryCode={countryCode} />
    </div>
  )
}
