'use client'

import { useEffect, useState, useTransition } from 'react'

import { ActivePoll } from '@/components/app/pagePolls/activePoll'
import { InactivePolls } from '@/components/app/pagePolls/inactivePolls'
import { PollResults } from '@/components/app/pagePolls/pollResults'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PollResultsDataResponse } from '@/data/polls/getPollsData'
import { usePollsResultsData } from '@/hooks/usePollsResultsData'
import { usePollsVotesFromUser } from '@/hooks/usePollsVotesFromUser'
import { useSession } from '@/hooks/useSession'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

export function PagePolls({
  description,
  title,
  activePoll,
  inactivePolls,
  pollsResultsData,
}: {
  description: string
  title: string
  activePoll: SWCPoll | null
  inactivePolls: SWCPoll[] | null
  pollsResultsData: Record<string, PollResultsDataResponse>
}) {
  const [isPendingVoteSubmissionTransaction, startVoteSubmissionTransaction] = useTransition()
  const { user, isUserProfileLoading, isLoggedIn } = useSession()
  const {
    data: userPollsData,
    isLoading: isPollsVotesLoading,
    mutate: refreshPollsVotesFromUser,
  } = usePollsVotesFromUser(user?.id)
  const {
    data: pollsResults,
    mutate: refreshPollsResults,
    isLoading: isPollsResultsLoading,
  } = usePollsResultsData(pollsResultsData)
  const [showResults, setShowResults] = useState(false)
  const [isVoteAgain, setIsVoteAgain] = useState(false)

  const handleShowResults = async () => {
    startVoteSubmissionTransaction(async () => {
      await refreshPollsVotesFromUser()
      await refreshPollsResults()
      setShowResults(true)
    })
  }

  const handleVoteAgain = () => {
    setShowResults(false)
    setIsVoteAgain(true)
  }

  const isLoading =
    isUserProfileLoading ||
    isPollsVotesLoading ||
    isPollsResultsLoading ||
    isPendingVoteSubmissionTransaction

  const hasAnyResults = Object.keys(pollsResultsData).length > 0
  const hasUserVoted = typeof userPollsData?.pollVote[activePoll?.id ?? ''] !== 'undefined'

  const shouldShowResults = showResults && hasAnyResults

  useEffect(() => {
    if (hasUserVoted && isLoggedIn) {
      setShowResults(true)
    }
  }, [hasUserVoted, isLoggedIn, setShowResults])

  return (
    <div className="standard-spacing-from-navbar container">
      <section className="container mb-16 max-w-3xl">
        <PageTitle className="mb-7">{title}</PageTitle>
        <PageSubTitle className="text-muted-foreground" size="md" withoutBalancer>
          {!activePoll && !inactivePolls ? (
            <div className="mt-12">
              <p>No Polls available at the moment.</p>
              <p>Please check back later.</p>
              <p className="mt-4">
                <InternalLink href="/about">Our mission</InternalLink>
              </p>
            </div>
          ) : (
            description
          )}
        </PageSubTitle>
      </section>
      <section className="container max-w-3xl">
        {activePoll &&
          (shouldShowResults ? (
            <PollResults
              currentPoll={activePoll}
              handleVoteAgain={handleVoteAgain}
              isLoading={isLoading}
              pollsResultsData={pollsResults}
              userPollsData={userPollsData}
            />
          ) : (
            <ActivePoll
              activePoll={activePoll}
              handleShowResults={handleShowResults}
              isLoading={isLoading}
              isVoteAgain={isVoteAgain}
              pollsResultsData={pollsResults}
              userPollsData={userPollsData}
            />
          ))}
      </section>
      {inactivePolls && (
        <section className="container max-w-3xl">
          <InactivePolls
            inactivePolls={inactivePolls}
            isLoading={isLoading}
            pollsResultsData={pollsResults}
            userPollsData={userPollsData}
          />
        </section>
      )}
    </div>
  )
}
