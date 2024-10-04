import { TurbovoteDisclaimer } from '@/components/app/pageVoterGuide/disclaimer'
import { VoterJourneyStepList } from '@/components/app/pageVoterGuide/voterJourneyStepList'
import { Badge } from '@/components/ui/badge'
import { Countdown } from '@/components/ui/countdown'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PageVoterGuide() {
  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <Badge
        className="flex w-full justify-between rounded-2xl p-6 text-sm font-bold md:text-base"
        variant="primary-cta-subtle"
      >
        <span className="hidden md:inline-block">Countdown to the election on Nov 5th</span>
        <span className="md:hidden">Countdown to election</span>

        <span className="font-normal md:font-bold">
          <Countdown targetDate={new Date('2024-11-05T00:00:00')} variant="compact" />
        </span>
      </Badge>

      <div className="space-y-2">
        <PageTitle size="xs">Your crypto voter guide</PageTitle>
        <PageSubTitle>
          This year’s election is critical to the future of crypto in America. Stand With Crypto is
          on a mission to inform voters on where politicians stand on crypto. Complete the following
          actions to make an informed vote.
        </PageSubTitle>
      </div>

      <VoterJourneyStepList className="w-full" />

      <TurbovoteDisclaimer />
    </div>
  )
}
