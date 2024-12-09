import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function EventsIntro() {
  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4 lg:gap-6">
        <PageTitle>Events</PageTitle>
        <PageSubTitle>
          Stand With Crypto Alliance is dedicated to engaging and empowering the crypto community
          both online and at real-world events. Crypto is a major force in our economy, our
          politics, and our culture – but we need to keep up the momentum.
        </PageSubTitle>
      </div>
    </section>
  )
}
