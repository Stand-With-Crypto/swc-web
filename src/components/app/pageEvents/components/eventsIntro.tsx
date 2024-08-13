import Balancer from 'react-wrap-balancer'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function EventsIntro() {
  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col gap-4 lg:gap-6">
        <PageTitle className="text-center font-sans text-xl text-foreground lg:text-4xl">
          Events
        </PageTitle>
        <p className="text-center font-mono text-base text-muted-foreground lg:text-xl">
          <Balancer>
            Stand With Crypto is dedicated to engaging and empowering the crypto community both
            online and at real-world events. Crypto is a major force in our economy, our politics,
            and our culture – but we need to keep up the momentum. See below for a list of events
            happening nationwide, as well as information about how you can host your own SWC
            meet-up.
          </Balancer>
        </p>
      </div>

      <div className="mt-20 flex flex-col items-center gap-4">
        <PageSubTitle className="text-center font-sans text-xl text-foreground">
          {'The America <3 Crypto Tour 2024'}
        </PageSubTitle>
        <p className="text-center font-mono text-base text-muted-foreground">
          <Balancer>
            Join Stand With Crypto on the America :heart: Crypto Tour, an epic concert series across
            5 swing states, rallying 4 million crypto owners to make their voices heard. Featuring
            iconic acts and memorable venues. See who’s coming to your state and when below.
          </Balancer>
        </p>
      </div>
    </section>
  )
}
