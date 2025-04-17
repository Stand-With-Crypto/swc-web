import { ReactNode } from 'react'

import { ActivePollsAndResults } from '@/components/app/pagePolls/activePollsAndResults'
import { InactivePollsResults } from '@/components/app/pagePolls/inactivePollsResults'
import { PollContainer } from '@/components/app/pagePolls/pollContainer'
import { PagePollsHeader } from '@/components/app/pagePolls/pollHeader'
import { PollResultsDataResponse } from '@/data/polls/getPollsData'

interface PagePollsProps {
  children: ReactNode
  initialPollsResultsData: Record<string, PollResultsDataResponse>
}

export function PagePolls({ children, initialPollsResultsData }: PagePollsProps) {
  return <PollContainer initialPollsResultsData={initialPollsResultsData}>{children}</PollContainer>
}

PagePolls.Header = PagePollsHeader
PagePolls.ActivePollsAndResults = ActivePollsAndResults
PagePolls.InactivePollsResults = InactivePollsResults
