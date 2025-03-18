import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { GbHero } from './hero'

const countryCode = SupportedCountryCodes.GB

export function GbPageHome({ topLevelMetrics }: HomePageProps) {
  return (
    <>
      <GbHero />
      <div className="container">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />
      </div>
    </>
  )
}
