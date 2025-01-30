import { GeoGate } from '@/components/app/geoGate'
import { MintingAnNFTButton, SumDonationsCounter } from '@/components/app/pageDonate'
import { DonateButton } from '@/components/app/pageDonate/donateButton'
import { PageDonateProps } from '@/components/app/pageDonate/pageDonate.types'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export function Heading({ countryCode, title, description, sumDonations }: PageDonateProps) {
  return (
    <section className="mt-12 space-y-7">
      <SumDonationsCounter countryCode={countryCode} initialData={sumDonations} />
      <PageTitle>{title}</PageTitle>
      <PageSubTitle>{description}</PageSubTitle>
      <GeoGate countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}>
        <DonateButton />
      </GeoGate>
      <PageSubTitle className="text-xs lg:text-sm">
        You can also contribute by <MintingAnNFTButton />
      </PageSubTitle>
    </section>
  )
}
