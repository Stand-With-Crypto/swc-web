import { SuspenseResubscribeButton } from '@/components/app/pageUnsubscribe/resubscribeButton'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.US

export default function UnsubscribeSuccessPage() {
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
        <PageTitle size="md">Unsubscribed Successfully</PageTitle>
        <PageSubTitle className="max-w-2xl">
          We're sorry to see you go.
          <br />
          Please <span className="text-primary-cta">resubscribe</span> if you've changed your mind.
        </PageSubTitle>

        <SuspenseResubscribeButton />
      </section>

      <section className="space-y-4 text-center">
        <InternalLink href={getIntlUrls(countryCode).home()}>StandWithCrypto.org</InternalLink>
      </section>
    </div>
  )
}
