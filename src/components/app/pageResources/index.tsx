import { ResourcesCards } from '@/components/app/pageResources/resourcesCard'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

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
        <div className="align-center flex flex-col justify-center gap-6 sm:flex-row">
          <UserActionFormEmailCongresspersonDialog
            campaignName={USUserActionEmailCampaignName.DEFAULT}
          >
            <Button className="w-full sm:w-auto">Email your congressperson</Button>
          </UserActionFormEmailCongresspersonDialog>
          <UserActionFormCallCongresspersonDialog>
            <Button className="w-full sm:w-auto">Call your congressperson</Button>
          </UserActionFormCallCongresspersonDialog>
        </div>
      </section>
      <section className="grid grid-cols-1 grid-rows-1 justify-items-center gap-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-10 sm:gap-y-20 md:grid-cols-3">
        <ResourcesCards
          href="/resources/fit21/docs/FIT21 One Pager.pdf"
          imageUrl="/resources/fit21/what-is-fit21.webp"
          subtitle="Learn about FIT21 and the importance to crypto."
          title="What is FIT21"
        />
        <ResourcesCards
          href="/resources/fit21/docs/FIT21 SWC Founder Support Letter.pdf"
          imageUrl="/resources/fit21/founder-letter.webp"
          subtitle="Builders across the US back FIT21 for innovation and jobs."
          title="Stand With Crypto Founder Letter"
        />
        <ResourcesCards
          href="/resources/fit21/docs/FIT21 Coalition Support Letter.pdf"
          imageUrl="/resources/fit21/fit21-coalition-support-letter.webp"
          subtitle="See why nearly 60 top crypto organizations urge passing FIT21."
          title="FIT21 Coalition Support Letter"
        />
        <ResourcesCards
          href="/resources/fit21/docs/Chamber of Progress HR 4763 - Backgrounder for House Staff.pdf"
          imageUrl="/resources/fit21/chamber-of-progress.webp"
          subtitle="Explore the Chamber of Progress's background on FIT21."
          title="Chamber of Progress on FIT21"
        />
        <ResourcesCards
          href="/resources/fit21/docs/Blockchain-Association-Letter-of-Support-for-H.R.-4763-Floor-Vote.pdf"
          imageUrl="/resources/fit21/blockchain-association.webp"
          subtitle="Read Blockchain Association’s take on FIT21."
          title="Blockchain Association Letter of Support"
        />
        <ResourcesCards
          href="/resources/fit21/docs/FIT21-BriefingBook2024.pdf"
          imageUrl="/resources/fit21/stand-with-crypto-overview.webp"
          subtitle="Read Stand With Crypto’s detailed FIT21 overview."
          title="FIT21 Overview from Stand With Crypto"
        />
      </section>
    </div>
  )
}
