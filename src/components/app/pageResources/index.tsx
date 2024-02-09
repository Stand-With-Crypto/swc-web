import { EventCard } from '@/components/app/pageResources/eventCard'
import { PolicyCard } from '@/components/app/pageResources/policyCard'
import { UserActionRowCTAsListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsListWithApi'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { UserActionType } from '@prisma/client'

const EXCLUDE_USER_ACTION_TYPES: UserActionType[] = ['NFT_MINT']

export function PageResources() {
  return (
    <div className="container">
      <section className="mb-16 space-y-7 text-center">
        <PageTitle>Your voice will shape the future of crypto in America</PageTitle>
        <PageSubTitle>
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
        <div className="grid grid-flow-col grid-rows-3 gap-4 lg:grid-rows-1">
          <EventCard
            cta="Watch"
            imageAltText="Stand With Crypto Day (Washington DC) event card image"
            imageUrl="/resources/eventCards/stand_with_crypto_day_dc.webp"
            link="https://www.youtube.com/watch?v=MzrUzOhgA6I"
            title="Stand With Crypto Day (Washington DC)"
          />
          <EventCard
            cta="Watch"
            imageAltText="Atlanta Advocate Town Hall event card image"
            imageUrl="/resources/eventCards/atlanta_advocate_town_hall.webp"
            link="https://www.youtube.com/watch?v=ETq_UZ1aRGQ"
            title="Atlanta Advocate Town Hall"
          />
          <EventCard
            cta="Watch"
            imageAltText="Crypto Presidential Forum (New Hampshire) event card image"
            imageUrl="/resources/eventCards/crypto_presidential_forum_nh_townhall.webp"
            link="https://www.youtube.com/watch?v=refW193w3Xw"
            title="Crypto Presidential Forum (New Hampshire)"
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
        <div className="flex flex-col gap-4">
          <PolicyCard
            description="Setting the foundational rules for crypto that are pro-consumer and pro-job creation"
            primaryCta="Learn more"
            primaryCtaUrl="https://www.standwithcrypto.org/docs/FIT21_One_Pager.pdf"
            title="FIT21 [H.R. 4763]"
          />
          <PolicyCard
            description="A regulatory framework for stablecoins like USDC"
            primaryCta="Learn more"
            primaryCtaUrl="https://www.standwithcrypto.org/docs/SWC_Stablecoin.pdf"
            title="Clarity for Stablecoin Act [H.R. 4766]"
          />
        </div>
      </section>

      <section className="mb-16 space-y-4 text-center">
        <PageTitle as="h2" size="sm">
          Get involved
        </PageTitle>
        <p>The future of crypto is in your hands. Here’s how you can help.</p>
        <UserActionRowCTAsListWithApi excludeUserActionTypes={EXCLUDE_USER_ACTION_TYPES} />
      </section>
    </div>
  )
}
