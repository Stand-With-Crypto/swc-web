import { KeyRacesDialog } from '@/components/app/pageVoterGuide/keyRacesDialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Badge } from '@/components/ui/badge'
import { Countdown } from '@/components/ui/countdown'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

import { VoterJourneyStepCard } from './voterJourneyStepCard'

export function PageVoterGuide() {
  return (
    <div className="standard-spacing-from-navbar container flex flex-col items-center justify-center gap-16">
      <div className="flex flex-col items-center justify-center gap-10">
        <Badge
          className="p-2.5 font-bold antialiased md:text-base lg:px-6 lg:py-3.5"
          variant="primary-cta-subtle"
        >
          Countdown to election on Nov 5
        </Badge>

        <Countdown targetDate={new Date('2024-11-05T00:00:00')} />
      </div>

      <div className="space-y-2">
        <PageTitle size="xs">Your voter journey</PageTitle>
        <PageSubTitle>
          Get informed, verify your registration status, and find a polling location near you.
        </PageSubTitle>
      </div>

      <div className="w-full space-y-4">
        <KeyRacesDialog>
          <VoterJourneyStepCard
            description="View key races in your area and see where politicians stand on crypto."
            status={'incomplete'}
            step={1}
            title="Get Informed"
          />
        </KeyRacesDialog>

        <UserActionFormVoterRegistrationDialog>
          <VoterJourneyStepCard
            description="Check your voter registration status. Earn a free NFT from pplpleasr."
            status={'incomplete'}
            step={2}
            title="Make sure you’re registered to vote"
          />
        </UserActionFormVoterRegistrationDialog>

        <VoterJourneyStepCard
          description="We’ll send you information on polling locations as it gets closer to the election."
          status={'incomplete'}
          step={3}
          title="Get updates"
        />
      </div>
    </div>
  )
}
