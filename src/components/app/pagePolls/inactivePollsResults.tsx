'use client'

import { useContext } from 'react'

import { PollContainerContext } from '@/components/app/pagePolls/pollContainer'
import { PollResults } from '@/components/app/pagePolls/pollResults'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

interface InactivePollsResultsProps {
  inactivePolls: SWCPoll[] | null
}

export function InactivePollsResults({ inactivePolls }: InactivePollsResultsProps) {
  const { isLoading, userPolls, pollsResults } = useContext(PollContainerContext)

  return (
    inactivePolls &&
    inactivePolls.length > 0 && (
      <section className="container mb-16 max-w-3xl p-4">
        <PageSubTitle className="mb-6 text-left text-foreground" size="2xl" withoutBalancer>
          Closed polls
        </PageSubTitle>
        <div className="flex flex-col gap-8">
          {inactivePolls.map(poll => (
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
      </section>
    )
  )
}
