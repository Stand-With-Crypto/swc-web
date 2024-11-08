import Balancer from 'react-wrap-balancer'

import { PageTitle } from '@/components/ui/pageTitleText'

export function EventsIntro() {
  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col gap-4 lg:gap-6">
        <PageTitle className="text-center font-sans text-3xl text-foreground lg:text-4xl">
          Events
        </PageTitle>
        <p className="text-center font-mono text-base text-muted-foreground lg:text-xl">
          <Balancer>
            Stand With Crypto Alliance is dedicated to engaging and empowering the crypto community
            both online and at real-world events. Crypto is a major force in our economy, our
            politics, and our culture – but we need to keep up the momentum.
          </Balancer>
        </p>
      </div>
    </section>
  )
}
