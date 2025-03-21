import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { AuHero } from './hero'

const countryCode = SupportedCountryCodes.AU

export function AuPageHome({ topLevelMetrics }: HomePageProps) {
  return (
    <div className="container">
      <section className="mb-16 md:mb-36">
        <AuHero />
      </section>
      <section className="mb-16 md:mb-36">
        <UserActionGridCTAs />
      </section>
      <section className="mb-16 md:mb-36">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />
      </section>
    </div>
  )
}
