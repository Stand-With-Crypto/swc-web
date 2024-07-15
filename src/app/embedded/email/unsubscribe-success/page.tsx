import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

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
        <PageTitle size="md">Unsubscribe successful</PageTitle>

        <PageSubTitle className="max-w-[600px]">
          Thank you for supporting Stand With Crypto and fighting to keep crypto in America. We sent
          you an NFT as a thank you for getting involved.
          <br />
          <br />
          Don't let this be the end - please continue to check SWC's social media profiles, our
          website, and your inbox for updates and future opportunities to engage.
        </PageSubTitle>
      </section>
    </div>
  )
}
