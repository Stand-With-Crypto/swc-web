import { ResourcesCards } from '@/components/app/pageResources/resourcesCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PageResources() {
  return (
    <div className="standard-spacing-from-navbar container">
      <section className="mb-16 space-y-7 text-center">
        <PageTitle>FIT21 Resources</PageTitle>
        <PageSubTitle>
          A historic bipartisan crypto bill, FIT21 (H.R. 4763), is about to be voted on in the U.S.
          House of Representatives.
          <br />
          <br />
          This Act will foster American innovation and protect consumers by creating a clear
          regulatory framework for crypto.
          <br />
          <br />
          Take a look at some FIT21 resources below.
        </PageSubTitle>
      </section>
      <section className="grid grid-cols-1 grid-rows-1 gap-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-5 sm:gap-y-10">
        <ResourcesCards
          imageUrl="/resources/fit21/what-is-fit21.webp"
          subtitle="Learn about FIT21 and the importance to crypto."
          title="What is FIT21"
        />
        <ResourcesCards
          imageUrl="/resources/fit21/fit21-coalition-support-letter.webp"
          subtitle="See what leading crypto organizations have to say about FIT21."
          title="FIT21 Coalition Support Letter"
        />
        <ResourcesCards
          imageUrl="/resources/fit21/blockchain-association.webp"
          subtitle="Learn about FIT21 and the importance to crypto."
          title="Chamber of Progress HR4763"
        />
        <ResourcesCards
          imageUrl="/resources/fit21/blockchain-association-letter-of-support.webp"
          subtitle="Read Blockchain Association’s take on FIT21."
          title="Blockchain Association Letter of Support"
        />
      </section>
    </div>
  )
}
