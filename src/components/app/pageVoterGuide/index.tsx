import { TurbovoteDisclaimer } from '@/components/app/pageVoterGuide/disclaimer'
import { VoterJourneyStepList } from '@/components/app/pageVoterGuide/voterJourneyStepList'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PageVoterGuide() {
  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <div className="space-y-2">
        <PageTitle size="xs">Your crypto voter guide</PageTitle>
        <PageSubTitle>
          This year's election is critical to the future of crypto in America. Stand With Crypto is
          on a mission to inform voters on where politicians stand on crypto. Complete the following
          actions to make an informed vote.
        </PageSubTitle>
      </div>

      <VoterJourneyStepList className="w-full" />

      <TurbovoteDisclaimer />
    </div>
  )
}
