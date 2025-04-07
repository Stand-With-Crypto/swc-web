'use client'

import { useCallback, useMemo } from 'react'
import { isEmpty } from 'lodash-es'

import { GeoGatedPollsContent } from '@/components/app/pagePolls/geoGatedPollsContent'
import { InactivePolls } from '@/components/app/pagePolls/inactivePolls'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { usePollsResultsData } from '@/hooks/usePollsResultsData'
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
    data: pollsResults,
    mutate: refreshPollsResults,
    isLoading: isPollsResultsLoading,
  } = usePollsResultsData(pollsResultsData)

  const userPolls: PollsVotesFromUserResponse = useMemo(
    () =>
      Object.values(pollsResults).reduce(
        (acc, pollResult) => {
          const { campaignName, answers } = pollResult

          const userAnswer = answers.find(currentAnswer => {
            return currentAnswer.userId === user?.id
          })

          return {
            ...acc,
            pollVote: {
              [campaignName]: {
                answers: userAnswer || [],
              },
            },
          }
        },
        {
          pollVote: {},
        },
      ),
    [pollsResults, user],
  )

  const isLoading = isUserProfileLoading || isPollsResultsLoading

  const hasActivePoll = activePolls && !isEmpty(activePolls)
  const hasInactivePolls = inactivePolls && !isEmpty(inactivePolls)
  const hasNoPolls = !hasActivePoll && !hasInactivePolls

  const handleRefreshVotes = useCallback(async () => {
    await refreshPollsResults()
  }, [refreshPollsResults])

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
