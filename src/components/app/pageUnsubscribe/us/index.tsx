import { PageUnsubscribeLayout } from '@/components/app/pageUnsubscribe/commom/layout'
import { SuspenseResubscribeButton } from '@/components/app/pageUnsubscribe/commom/resubscribeButton'
import { UsSocialIcons } from '@/components/app/pageUnsubscribe/us/socialIcons'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.US

export function UsUnsubscribeSuccessPage() {
  return (
    <PageUnsubscribeLayout>
      <PageUnsubscribeLayout.Logo src="/logo/shield.svg" />
      <PageUnsubscribeLayout.ContentSection>
        <PageUnsubscribeLayout.Heading />
        <SuspenseResubscribeButton countryCode={countryCode} />
      </PageUnsubscribeLayout.ContentSection>

      <PageUnsubscribeLayout.SocialSection>
        <UsSocialIcons />
        <InternalLink href={getIntlUrls(countryCode).home()}>StandWithCrypto.org</InternalLink>
      </PageUnsubscribeLayout.SocialSection>
    </PageUnsubscribeLayout>
  )
}
