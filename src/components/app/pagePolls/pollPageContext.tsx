import { createContext, ReactNode, useContext } from 'react'

import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'

interface PollPageContextValues {
  isLoading: boolean
  userPolls: PollsVotesFromUserResponse | undefined
  pollsResults: Record<string, PollResultsDataResponse>
  handleRefreshVotes: () => Promise<void>
}

const PollPageContext = createContext<PollPageContextValues>({
  isLoading: false,
  userPolls: undefined,
  pollsResults: {},
  handleRefreshVotes: async () => {},
})

export function PollPageContextProvider({
  children,
  contextValue,
}: {
  children: ReactNode
  contextValue: PollPageContextValues
}) {
  return <PollPageContext.Provider value={contextValue}>{children}</PollPageContext.Provider>
}

export function usePollPageContext() {
  const contextValue = useContext(PollPageContext)

  if (!contextValue) {
    throw new Error('usePollPageContext called outside of PollPageContext')
  }

  return contextValue
}
