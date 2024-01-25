import { EventCard } from '@/components/app/pageResources/eventCard'
import { UserActionRowCTAsListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsListWithApi'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PageResources() {
  return (
    <div className="container">
      <section className="mb-16 space-y-7 text-center">
        <PageTitle>Your voice will shape the future of crypto in America</PageTitle>
        <PageSubTitle className="gap-10">
          Every day lawmakers are discussing policies and regulations that impact your ability to
          use crypto. They care what you think, but you have to make sure that you are connecting
          with your lawmakers.
          <br /> <br />
          The US sat idly by with semiconductor manufacturing, and now 92% of advanced production is
          located in Taiwan and South Korea. We can’t let history repeat itself, and must ensure the
          US isn’t sidelined from the future financial system.
        </PageSubTitle>
      </section>

      <section className="mb-16 space-y-4 text-center">
        <PageTitle as="h2" size="sm">
          Events
        </PageTitle>
        <p>Learn more about recent and upcoming events to mobilize the crypto community.</p>
        <div className="grid grid-flow-col grid-rows-3  gap-4 md:grid-rows-1">
          <EventCard
            imageUrl="/resources/eventCards/stand_with_crypto_day_dc.webp"
            title="Stand With Crypto Day (Washington DC)"
            cta="Watch"
            link="https://www.youtube.com/watch?v=MzrUzOhgA6I"
          />
          <EventCard
            imageUrl="/resources/eventCards/atlanta_advocate_town_hall.webp"
            title="Atlanta Advocate Town Hall"
            cta="Watch"
            link="https://www.youtube.com/watch?v=ETq_UZ1aRGQ"
          />
          <EventCard
            imageUrl="/resources/eventCards/crypto_presidential_forum_nh_townhall.webp"
            title="Crypto Presidential Forum (New Hampshire)"
            cta="Watch"
            link="https://www.youtube.com/watch?v=refW193w3Xw"
          />
        </div>
      </section>

      <section className="mb-16 space-y-4 text-center">
        <PageTitle as="h2" size="sm">
          Policy
        </PageTitle>
        <p>
          Learn more about the pending bills and resolutions that can shape the industry’s future.
        </p>
      </section>

      <section className="mb-16 space-y-4 text-center">
        <PageTitle as="h2" size="sm">
          Get involved
        </PageTitle>
        <p>The future of crypto is in your hands. Here’s how you can help.</p>
        <UserActionRowCTAsListWithApi />
      </section>
    </div>
  )
}
