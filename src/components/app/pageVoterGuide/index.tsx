import { TurbovoteDisclaimer } from '@/components/app/pageVoterGuide/disclaimer'
import { VoterJourneyStepList } from '@/components/app/pageVoterGuide/voterJourneyStepList'
import { Badge } from '@/components/ui/badge'
import { Countdown } from '@/components/ui/countdown'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PageVoterGuide() {
  return (
    <div className="standard-spacing-from-navbar container flex flex-col items-center gap-16">
      <div className="space-y-2">
        <PageTitle size="xs">Voter guide</PageTitle>
        <PageSubTitle>
          This year's election is critical to the future of crypto. Here's how to become an informed
          voter.
        </PageSubTitle>
      </div>

      <VoterJourneyStepList className="w-full" />

      <div className="flex flex-col items-center justify-center gap-10">
        <Badge
          className="p-2.5 font-bold antialiased md:text-base lg:px-6 lg:py-3.5"
          variant="primary-cta-subtle"
        >
          Countdown to election on Nov 5
        </Badge>

        <Countdown targetDate={new Date('2024-11-05T00:00:00')} />
      </div>

      <TurbovoteDisclaimer />
    </div>
  )
}
