import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export const dynamic = 'error'

const countryCode = SupportedCountryCodes.US

export default function ResubscribeSuccessPageRoot() {
  return (
    <div className="container mt-20 flex flex-col items-center gap-20">
      <NextImage
        alt={'Stand With Crypto Logo'}
        height={80}
        priority
        src="/logo/shield.svg"
        width={80}
      />

      <section className="space-y-8">
        <PageTitle size="md">Welcome Back</PageTitle>
        <PageSubTitle>
          Your email address has been added again for the latest news from Stand With Crypto.
          <br />
          <br />
          Thank you!
        </PageSubTitle>
      </section>

      <section className="space-y-8">
        <InternalLink href={getIntlUrls(countryCode).home()}>StandWithCrypto.org</InternalLink>
      </section>
    </div>
  )
}
