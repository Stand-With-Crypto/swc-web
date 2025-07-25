import { PageUnsubscribeLayout } from '@/components/app/pageUnsubscribe/commom/layout'
import { SuspenseResubscribeButton } from '@/components/app/pageUnsubscribe/commom/resubscribeButton'
import { GbSocialIcons } from '@/components/app/pageUnsubscribe/gb/socialIcons'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.GB

export function GbUnsubscribeSuccessPage() {
  return (
    <PageUnsubscribeLayout>
      <PageUnsubscribeLayout.Logo src="/gb/logo/shield.svg" />
      <PageUnsubscribeLayout.ContentSection>
        <PageUnsubscribeLayout.Heading />
        <SuspenseResubscribeButton />
      </PageUnsubscribeLayout.ContentSection>

      <PageUnsubscribeLayout.SocialSection>
        <GbSocialIcons />
        <InternalLink href={getIntlUrls(countryCode).home()}>StandWithCrypto.org</InternalLink>
      </PageUnsubscribeLayout.SocialSection>
    </PageUnsubscribeLayout>
  )
}
