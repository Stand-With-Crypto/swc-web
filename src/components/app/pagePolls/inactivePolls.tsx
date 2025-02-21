'use client'

import { PollResults } from '@/components/app/pagePolls/pollResults'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

interface InactivePollsProps {
  inactivePolls: SWCPoll[]
  pollsResults: Record<string, PollResultsDataResponse>
  isLoading: boolean
  userPolls: PollsVotesFromUserResponse | undefined
}

export function InactivePolls({
  inactivePolls,
  pollsResults,
  isLoading,
  userPolls,
}: InactivePollsProps) {
  return (
    <div className="px-4">
      <PageSubTitle className="mb-6 text-left text-foreground" size="2xl" withoutBalancer>
        Closed polls
      </PageSubTitle>
      <div className="flex flex-col gap-8">
        {inactivePolls &&
          inactivePolls.map(poll => (
            <div className="rounded-2xl bg-secondary" key={poll.id}>
              <PollResults
                currentPoll={poll}
                isInactivePoll={true}
                isLoading={isLoading}
                pollsResults={pollsResults}
                shouldHideVoteAgain={true}
                userPolls={userPolls}
              />
            </div>
          ))}
      </div>
    </div>
  )
}
