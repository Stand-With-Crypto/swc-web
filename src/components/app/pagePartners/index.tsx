import { PartnerGrid } from '@/components/app/partnerGrid'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'

interface PagePartnersProps {
  title: string
  description: string
  locale: SupportedLocale
}

export function PagePartners({ title, description, locale }: PagePartnersProps) {
  return (
    <div className="container space-y-20">
      <section className="space-y-9">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild className="w-full sm:w-auto" variant="secondary">
            <InternalLink href={getIntlUrls(locale).contribute()}>Contribute</InternalLink>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <ExternalLink
              href={
                'https://docs.google.com/forms/d/e/1FAIpQLSf4T51k9InqKQKW2911_HVWm11wz_dOcpoDj8QuyF7cxU5MHw/viewform'
              }
            >
              Become an industry partner
            </ExternalLink>
          </Button>
        </div>
      </section>

      <section>
        <PartnerGrid variant="contained" />
      </section>
    </div>
  )
}
