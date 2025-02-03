import { PartnerGrid } from '@/components/app/pagePartners/partnerGrid'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface PagePartnersProps {
  title: string
  description: string
  countryCode: SupportedCountryCodes
}

export function PagePartners({ title, description, countryCode }: PagePartnersProps) {
  return (
    <div className="standard-spacing-from-navbar container space-y-20">
      <section className="space-y-9">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>

        <div className="flex flex-col-reverse items-center justify-center gap-4 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <InternalLink href={getIntlUrls(countryCode).contribute()}>
              Become an industry partner
            </InternalLink>
          </Button>
        </div>
      </section>

      <section>
        <PartnerGrid />
      </section>
    </div>
  )
}
