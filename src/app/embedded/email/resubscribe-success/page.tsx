import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export const dynamic = 'error'

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
        <PageTitle size="md">Resubscribe Successful</PageTitle>

        <PageSubTitle className="max-w-[600px]">
          Thank you!
          <br />
          We've gone ahead and updated your email preferences, so you're all set to hear the latest
          news from Stand with Crypto.
        </PageSubTitle>
      </section>
    </div>
  )
}
