'use client'

import { GeoGate } from '@/components/app/geoGate'
import { ActivePoll } from '@/components/app/pagePolls/activePoll'
import { PollResults } from '@/components/app/pagePolls/pollResults'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

interface GeoGateContentProps {
  activePoll: SWCPoll
  shouldShowResults: boolean
  handleShowResults: () => void
  handleVoteAgain: () => void
  isLoading: boolean
  pollsResults: Record<string, PollResultsDataResponse>
  userPolls: PollsVotesFromUserResponse | undefined
}

export function GeoGateContent({
  activePoll,
  shouldShowResults,
  handleShowResults,
  handleVoteAgain,
  isLoading,
  pollsResults,
  userPolls,
}: GeoGateContentProps) {
  return (
    <GeoGate
      unavailableContent={
        <PollResults
          currentPoll={activePoll}
          isInactivePoll
          isLoading={isLoading}
          pollsResults={pollsResults}
          shouldHideVoteAgain
          userPolls={userPolls}
        />
      }
    >
      {!shouldShowResults ? (
        <PollResults
          currentPoll={activePoll}
          handleVoteAgain={handleVoteAgain}
          isLoading={isLoading}
          pollsResults={pollsResults}
          userPolls={userPolls}
        />
      ) : (
        <ActivePoll
          activePoll={activePoll}
          handleShowResults={handleShowResults}
          isLoading={isLoading}
          pollsResults={pollsResults}
          userPolls={userPolls}
        />
      )}
    </GeoGate>
  )
}
