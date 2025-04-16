import { ReactNode } from 'react'

import { ActivePollsAndResults } from '@/components/app/pagePolls/activePollsAndResults'
import { InactivePollsResults } from '@/components/app/pagePolls/inactivePollsResults'
import { PollContainer } from '@/components/app/pagePolls/pollContainer'
import { PagePollsHeader } from '@/components/app/pagePolls/pollHeader'
import { PollResultsDataResponse } from '@/data/polls/getPollsData'

interface PagePollsProps {
  children: ReactNode
  title: string
  description: string
  pollsResultsData: Record<string, PollResultsDataResponse>
}

export function PagePolls({ children, pollsResultsData }: PagePollsProps) {
  return <PollContainer pollsResultsData={pollsResultsData}>{children}</PollContainer>
}

PagePolls.Header = PagePollsHeader
PagePolls.ActivePollsAndResults = ActivePollsAndResults
PagePolls.InactivePollsResults = InactivePollsResults
