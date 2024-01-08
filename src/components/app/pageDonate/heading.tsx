import { SumDonationsCounter, MintingAnNFTButton } from '@/components/app/pageDonate'
import { PageDonateProps } from '@/components/app/pageDonate/pageDonate.types'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { externalUrls } from '@/utils/shared/urls'

export function Heading({ locale, title, description, sumDonations }: PageDonateProps) {
  return (
    <section className="mt-12 space-y-7">
      <SumDonationsCounter initialData={sumDonations} locale={locale} />
      <PageTitle>{title}</PageTitle>
      <PageSubTitle>{description}</PageSubTitle>

      <div className="flex justify-center">
        <Button size="lg" asChild>
          <ExternalLink href={externalUrls.donate()}>Donate</ExternalLink>
        </Button>
      </div>

      <PageSubTitle className="text-xs lg:text-sm">
        You can also contribute by <MintingAnNFTButton />
      </PageSubTitle>
    </section>
  )
}
