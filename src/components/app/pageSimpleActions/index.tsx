import { SimpleActionsGrid } from '@/components/app/pageSimpleActions/grid'
import { SimpleActionsGroupName } from '@/components/app/pageSimpleActions/types'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PageSimpleActionsProps {
  title: string
  subtitle: string
  campaignName: SimpleActionsGroupName
  countryCode: SupportedCountryCodes
  titleSize?: 'lg' | 'md' | 'sm' | 'xl' | 'xs' | 'xxs'
  subtitleSize?: 'lg' | 'md' | 'sm' | 'xl' | '2xl'
}

export function PageSimpleActions({
  title,
  subtitle,
  campaignName,
  countryCode,
  subtitleSize = 'lg',
  titleSize = 'xl',
}: PageSimpleActionsProps) {
  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <div className="space-y-4">
        <PageTitle size={titleSize}>{title}</PageTitle>
        <PageSubTitle size={subtitleSize}>{subtitle}</PageSubTitle>
      </div>

      <SimpleActionsGrid campaignName={campaignName} countryCode={countryCode} />
    </div>
  )
}
