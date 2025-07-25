import { PageUnsubscribeLayout } from '@/components/app/pageUnsubscribe/commom/layout'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

export const dynamic = 'error'

export default async function ResubscribeSuccessPageRoot(props: PageProps) {
  const { countryCode } = await props.params

  const logoSrc = countryCode === 'us' ? '/logo/shield.svg' : `/${countryCode}/logo/shield.svg`

  return (
    <PageUnsubscribeLayout>
      <PageUnsubscribeLayout.Logo src={logoSrc} />
      <PageUnsubscribeLayout.ContentSection>
        <PageTitle size="md">Welcome Back</PageTitle>
        <PageSubTitle>
          Your email address has been added again for the latest news from Stand With Crypto.
          <br />
          Thank you!
        </PageSubTitle>
      </PageUnsubscribeLayout.ContentSection>

      <PageUnsubscribeLayout.SocialSection>
        <InternalLink href={getIntlUrls(countryCode).home()}>StandWithCrypto.org</InternalLink>
      </PageUnsubscribeLayout.SocialSection>
    </PageUnsubscribeLayout>
  )
}
