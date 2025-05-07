'use client'

import { ReactNode, useCallback } from 'react'

import { PollPageContextProvider } from '@/components/app/pagePolls/pollPageContext'
import { PollResultsDataResponse } from '@/data/polls/getPollsData'
import { usePollsResultsData } from '@/hooks/usePollsResultsData'
import { usePollsVotesFromUser } from '@/hooks/usePollsVotesFromUser'
import { useSession } from '@/hooks/useSession'

interface PollContainerProps {
  children: ReactNode
  initialPollsResultsData: Record<string, PollResultsDataResponse>
}

export function PollContainer({ children, initialPollsResultsData }: PollContainerProps) {
  const { isUserProfileLoading } = useSession()
  const {
    data: userPolls,
    isLoading: isPollsVotesLoading,
    mutate: refreshPollsVotesFromUser,
  } = usePollsVotesFromUser()
  const {
    data: pollsResults,
    mutate: refreshPollsResults,
    isLoading: isPollsResultsLoading,
  } = usePollsResultsData(initialPollsResultsData)

  const isLoading = isUserProfileLoading || isPollsVotesLoading || isPollsResultsLoading

  const handleRefreshVotes = useCallback(async () => {
    await Promise.all([refreshPollsVotesFromUser(), refreshPollsResults()])
  }, [refreshPollsResults, refreshPollsVotesFromUser])

  return (
    <div className="standard-spacing-from-navbar container px-2">
      <PollPageContextProvider
        contextValue={{ isLoading, userPolls, pollsResults, handleRefreshVotes }}
      >
        {children}
      </PollPageContextProvider>
    </div>
  )
}
