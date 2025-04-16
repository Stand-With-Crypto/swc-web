'use client'

import { createContext, ReactNode, useCallback } from 'react'

import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { usePollsResultsData } from '@/hooks/usePollsResultsData'
import { usePollsVotesFromUser } from '@/hooks/usePollsVotesFromUser'
import { useSession } from '@/hooks/useSession'

interface PollContainerProps {
  children: ReactNode
  pollsResultsData: Record<string, PollResultsDataResponse>
}

export const PollContainerContext = createContext<{
  isLoading: boolean
  userPolls: PollsVotesFromUserResponse | undefined
  pollsResults: Record<string, PollResultsDataResponse>
  handleRefreshVotes: () => Promise<void>
}>({
  isLoading: false,
  userPolls: undefined,
  pollsResults: {},
  handleRefreshVotes: async () => {},
})

export function PollContainer({ children, pollsResultsData }: PollContainerProps) {
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
  } = usePollsResultsData(pollsResultsData)

  const isLoading = isUserProfileLoading || isPollsVotesLoading || isPollsResultsLoading

  const handleRefreshVotes = useCallback(async () => {
    await Promise.all([refreshPollsVotesFromUser(), refreshPollsResults()])
  }, [refreshPollsResults, refreshPollsVotesFromUser])

  return (
    <div className="standard-spacing-from-navbar container px-2">
      <PollContainerContext.Provider
        value={{ isLoading, userPolls, pollsResults, handleRefreshVotes }}
      >
        {children}
      </PollContainerContext.Provider>
    </div>
  )
}
