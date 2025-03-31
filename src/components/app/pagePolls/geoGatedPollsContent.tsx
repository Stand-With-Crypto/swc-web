'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import * as Sentry from '@sentry/nextjs'

import { actionCreateUserActionPoll } from '@/actions/actionCreateUserActionPoll'
import { GeoGate } from '@/components/app/geoGate'
import { ActivePoll, PollSubmitData } from '@/components/app/pagePolls/activePoll'
import { PollResults } from '@/components/app/pagePolls/pollResults'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { useSession } from '@/hooks/useSession'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

interface GeoGatedPollsContentProps {
  activePoll: SWCPoll
  isLoading: boolean
  pollsResults: Record<string, PollResultsDataResponse>
  userPolls: PollsVotesFromUserResponse | undefined
  handleRefreshVotes: () => Promise<void>
}

export function GeoGatedPollsContent({
  activePoll,
  isLoading,
  pollsResults,
  userPolls,
  handleRefreshVotes,
}: GeoGatedPollsContentProps) {
  const [showResults, setShowResults] = useState(false)
  const [isPendingVoteSubmissionTransaction, startVoteSubmissionTransaction] = useTransition()
  const { isLoggedIn, user } = useSession()

  const handleShowResults = useCallback(async () => {
    startVoteSubmissionTransaction(async () => {
      await handleRefreshVotes()
    })
    setShowResults(true)
  }, [handleRefreshVotes, startVoteSubmissionTransaction])

  const handleSubmitVote = useCallback(
    async (pollData: PollSubmitData) => {
      setShowResults(true)
      startVoteSubmissionTransaction(async () => {
        await actionCreateUserActionPoll(pollData)
          .catch(error => {
            Sentry.captureException(error, {
              tags: { domain: 'actionCreateUserActionPoll' },
              extra: { userId: user?.id },
            })
          })
          .finally(handleRefreshVotes)
      })
    },
    [handleRefreshVotes, user?.id],
  )

  const handleVoteAgain = useCallback(() => {
    setShowResults(false)
  }, [setShowResults])

  const hasAnyResults = Object.keys(pollsResults).length > 0
  const hasUserVoted = typeof userPolls?.pollVote[activePoll?.id ?? ''] !== 'undefined'

  const shouldShowResults = showResults && hasAnyResults

  useEffect(() => {
    if (hasUserVoted && isLoggedIn && hasAnyResults) {
      setShowResults(true)
    }
  }, [hasAnyResults, hasUserVoted, isLoggedIn, setShowResults])

  return (
    <GeoGate
      unavailableContent={
        <ActivePoll
          activePoll={activePoll}
          handleShowResults={handleShowResults}
          handleSubmitVote={handleSubmitVote}
          isLoading={isLoading || isPendingVoteSubmissionTransaction}
          pollsResults={pollsResults}
          shouldHideVotes
          userPolls={userPolls}
        />
      }
    >
      {shouldShowResults ? (
        <PollResults
          currentPoll={activePoll}
          handleVoteAgain={handleVoteAgain}
          isLoading={isLoading || isPendingVoteSubmissionTransaction}
          pollsResults={pollsResults}
          userPolls={userPolls}
        />
      ) : (
        <ActivePoll
          activePoll={activePoll}
          handleShowResults={handleShowResults}
          handleSubmitVote={handleSubmitVote}
          isLoading={isLoading || isPendingVoteSubmissionTransaction}
          pollsResults={pollsResults}
          userPolls={userPolls}
        />
      )}
    </GeoGate>
  )
}
