import { CaSocialIcons } from '@/components/app/pageUnsubscribe/ca/socialIcons'
import { PageUnsubscribeLayout } from '@/components/app/pageUnsubscribe/commom/layout'
import { SuspenseResubscribeButton } from '@/components/app/pageUnsubscribe/commom/resubscribeButton'
import { InternalLink } from '@/components/ui/link'
import { getSWCLegalEntityNameByCountryCode } from '@/utils/shared/legalUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.CA

export function CaUnsubscribeSuccessPage() {
  return (
    <PageUnsubscribeLayout>
      <PageUnsubscribeLayout.Logo src="/au/logo/shield.svg" />
      <PageUnsubscribeLayout.ContentSection>
        <PageUnsubscribeLayout.Heading
          entityName={getSWCLegalEntityNameByCountryCode(countryCode)}
        />
        <SuspenseResubscribeButton countryCode={countryCode} />
      </PageUnsubscribeLayout.ContentSection>

      <PageUnsubscribeLayout.SocialSection>
        <CaSocialIcons />
        <InternalLink href={getIntlUrls(countryCode).home()}>StandWithCrypto.org</InternalLink>
      </PageUnsubscribeLayout.SocialSection>
    </PageUnsubscribeLayout>
  )
}
