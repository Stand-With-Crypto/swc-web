import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { CaHero } from './hero'

const countryCode = SupportedCountryCodes.CA

export function CaPageHome({ topLevelMetrics }: HomePageProps) {
  return (
    <>
      <CaHero />
      <div className="container">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />
      </div>
    </>
  )
}
