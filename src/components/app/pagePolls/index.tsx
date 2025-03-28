'use client'

import { useCallback } from 'react'
import { isEmpty } from 'lodash-es'

import { GeoGatedPollsContent } from '@/components/app/pagePolls/geoGatedPollsContent'
import { InactivePolls } from '@/components/app/pagePolls/inactivePolls'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PollResultsDataResponse } from '@/data/polls/getPollsData'
import { usePollsResultsData } from '@/hooks/usePollsResultsData'
import { usePollsVotesFromUser } from '@/hooks/usePollsVotesFromUser'
import { useSession } from '@/hooks/useSession'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

export function PagePolls({
  description,
  title,
  activePolls,
  inactivePolls,
  pollsResultsData,
}: {
  description: string
  title: string
  activePolls: SWCPoll[] | null
  inactivePolls: SWCPoll[] | null
  pollsResultsData: Record<string, PollResultsDataResponse>
}) {
  const { user, isUserProfileLoading } = useSession()
  const {
    data: userPolls,
    isLoading: isPollsVotesLoading,
    mutate: refreshPollsVotesFromUser,
  } = usePollsVotesFromUser(user?.id)
  const {
    data: pollsResults,
    mutate: refreshPollsResults,
    isLoading: isPollsResultsLoading,
  } = usePollsResultsData(pollsResultsData)

  const isLoading = isUserProfileLoading || isPollsVotesLoading || isPollsResultsLoading

  const hasActivePoll = activePolls && !isEmpty(activePolls)
  const hasInactivePolls = inactivePolls && !isEmpty(inactivePolls)
  const hasNoPolls = !hasActivePoll && !hasInactivePolls

  const handleRefreshVotes = useCallback(async () => {
    await refreshPollsVotesFromUser()
    await refreshPollsResults()
  }, [refreshPollsResults, refreshPollsVotesFromUser])

  return (
    <div className="standard-spacing-from-navbar container px-2">
      <section className="container mb-16 max-w-3xl p-0">
        <PageTitle className="mb-7">{title}</PageTitle>
        <PageSubTitle className="text-muted-foreground" size="md" withoutBalancer>
          {hasNoPolls ? (
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
      {hasActivePoll &&
        activePolls?.map(activePoll => (
          <section className="container mb-16 max-w-3xl p-0" key={activePoll.id}>
            <GeoGatedPollsContent
              activePoll={activePoll}
              handleRefreshVotes={handleRefreshVotes}
              isLoading={isLoading}
              pollsResults={pollsResults}
              userPolls={userPolls}
            />
          </section>
        ))}
      {hasInactivePolls && (
        <section className="container max-w-3xl p-0">
          <InactivePolls
            inactivePolls={inactivePolls}
            isLoading={isLoading}
            pollsResults={pollsResults}
            userPolls={userPolls}
          />
        </section>
      )}
    </div>
  )
}
