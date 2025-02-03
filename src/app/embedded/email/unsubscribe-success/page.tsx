import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export const dynamic = 'error'

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
        <PageTitle size="md">Unsubscribe Successful</PageTitle>

        <PageSubTitle className="max-w-[600px]">
          We're sorry to see you go, but there's still ways to be involved without communicating
          with us via email.
          <br />
          <br />
          Check out{' '}
          <InternalLink href={getIntlUrls(SupportedCountryCodes.US).home()} replace>
            www.StandWithCrypto.org
          </InternalLink>{' '}
          for easy tools that let you reach out to lawmakers, check your voter registration, and
          more. And don't forget to follow SWC on social media for the latest updates.
        </PageSubTitle>
      </section>
    </div>
  )
}
