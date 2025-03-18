import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { AuHero } from './hero'

const countryCode = SupportedCountryCodes.AU

export function AuPageHome({ topLevelMetrics }: HomePageProps) {
  return (
    <>
      <AuHero />
      <div className="container">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />
      </div>
    </>
  )
}
