import { PartnerGrid } from '@/components/app/pageHome/common/partnerGrid'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { AuHero } from './hero'

const countryCode = SupportedCountryCodes.AU

const urls = getIntlUrls(countryCode)

export function AuPageHome({ topLevelMetrics, partners }: HomePageProps) {
  return (
    <>
      <AuHero />
      <div className="container">
        <TopLevelMetrics countryCode={countryCode} {...topLevelMetrics} />

        <section className="mb-16 text-center md:mb-36">
          <PageTitle as="h3" className="mb-6 !text-[32px]">
            Our partners
          </PageTitle>
          <PageSubTitle as="h4" className="mb-10">
            We’re proud to partner with some of the most influential and forward-thinking companies
            driving innovation through blockchain and crypto.
          </PageSubTitle>
          <div className="space-y-6">
            <PartnerGrid partners={partners} />
            <Button asChild variant="secondary">
              <InternalLink href={urls.partners()}>View all</InternalLink>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
