'use client'

import { ActivePollWithGeoGate } from '@/components/app/pagePolls/activePollWithGeoGate'
import { usePollPageContext } from '@/components/app/pagePolls/pollPageContext'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

export function ActivePollsAndResults({ activePolls }: { activePolls: SWCPoll[] | null }) {
  const { isLoading, userPolls, pollsResults, handleRefreshVotes } = usePollPageContext()

  return (
    activePolls &&
    activePolls.length > 0 &&
    activePolls.map(activePoll => (
      <section className="container mb-16 max-w-3xl p-0" key={activePoll.id}>
        <ActivePollWithGeoGate
          activePoll={activePoll}
          handleRefreshVotes={handleRefreshVotes}
          isLoading={isLoading}
          pollsResults={pollsResults}
          userPolls={userPolls}
        />
      </section>
    ))
  )
}
