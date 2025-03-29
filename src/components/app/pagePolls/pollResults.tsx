'use client'

import { useMemo } from 'react'
import { ReloadIcon } from '@radix-ui/react-icons'

import { PollLegend } from '@/components/app/pagePolls/pollLegend'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { pluralize } from '@/utils/shared/pluralize'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

import { PollResultItem, PollResultItemOther } from './pollResultItem'

interface PollResultsProps {
  currentPoll: SWCPoll
  pollsResults: Record<string, PollResultsDataResponse>
  userPolls: PollsVotesFromUserResponse | undefined
  isLoading: boolean
  handleVoteAgain?: () => void
  shouldHideVoteAgain?: boolean
  isInactivePoll?: boolean
}

function getPercentage(totalVotes: number, optionVotes: number) {
  return totalVotes ? ((optionVotes || 0) / totalVotes) * 100 : 0
}

function getVotesInfo({
  multiple,
  totalAbsoluteVotes,
  percentage,
}: {
  multiple: boolean
  totalAbsoluteVotes: number
  percentage: number
}) {
  return multiple
    ? pluralize({
        count: totalAbsoluteVotes,
        singular: `${totalAbsoluteVotes} vote`,
        plural: `${totalAbsoluteVotes} votes`,
      })
    : `${percentage.toFixed(0)}%`
}

export function PollResults({
  currentPoll,
  pollsResults,
  userPolls,
  isLoading,
  handleVoteAgain,
  shouldHideVoteAgain,
  isInactivePoll,
}: PollResultsProps) {
  const {
    id: pollId,
    data: { pollTitle, allowOther, maxNumberOptionsSelected, endDate, pollList },
  } = currentPoll

  const maxNumberOfOptions = maxNumberOptionsSelected ?? 0
  const multiple = maxNumberOfOptions === 0 || maxNumberOfOptions > 1

  const userVotes = userPolls?.pollVote[pollId]

  const totalPollVotes = useMemo(
    () =>
      pollsResults[pollId]?.computedAnswers.reduce(
        (acc: number, curr: any) => acc + curr.totalVotes,
        0,
      ),
    [pollId, pollsResults],
  )

  const pollResultsList = useMemo(
    () =>
      pollList.map(option => {
        const optionData = pollsResults[pollId]?.computedAnswers.find(
          (answer: any) => answer.answer === option.value,
        )

        const percentage = getPercentage(totalPollVotes, optionData?.totalVotes || 0)
        const isUserVote =
          typeof userVotes?.answers.find(answer => answer.answer === option.value) !== 'undefined'
        const totalAbsoluteVotes = optionData?.totalVotes ?? 0

        const votesInfo = getVotesInfo({
          multiple,
          totalAbsoluteVotes,
          percentage,
        })

        return {
          votesInfo,
          value: option.value,
          displayName: option.displayName,
          isUserVote,
          totalAbsoluteVotes,
          percentage,
        }
      }),
    [pollList, pollsResults, pollId, totalPollVotes, userVotes, multiple],
  )

  const pollResultsListWithOther = useMemo(
    () =>
      pollsResults[pollId]?.computedAnswersWithOther
        .filter(answer => !pollList.find(option => option.value === answer.answer))
        .map(otherAnswer => {
          const percentage = getPercentage(totalPollVotes, otherAnswer.totalVotes || 0)
          const isOtherAnswer =
            typeof userVotes?.answers.find(answer => answer.isOtherAnswer) !== 'undefined'
          const totalAbsoluteVotes = otherAnswer?.totalVotes ?? 0

          const votesInfo = getVotesInfo({
            multiple,
            totalAbsoluteVotes,
            percentage,
          })

          return {
            votesInfo,
            value: otherAnswer.answer,
            displayName: 'Other',
            isOtherAnswer,
            totalAbsoluteVotes,
            percentage,
          }
        }),
    [multiple, pollId, pollList, pollsResults, totalPollVotes, userVotes?.answers],
  )

  return (
    <div className="p-4">
      <PollLegend endDate={endDate} isInactivePoll={isInactivePoll} />
      <PageSubTitle
        as="h3"
        className="mb-4 mt-2 text-left text-foreground"
        size="lg"
        withoutBalancer
      >
        {pollTitle}
      </PageSubTitle>
      <div className="flex flex-col gap-2">
        {pollResultsList.map(resultItem => {
          return (
            <PollResultItem
              displayName={resultItem.displayName}
              isLoading={isLoading}
              isUserVote={resultItem.isUserVote}
              key={resultItem.value}
              percentage={resultItem.percentage}
              value={resultItem.value}
              votesInfo={resultItem.votesInfo}
            />
          )
        })}
        {allowOther && (
          <div className="flex flex-col gap-2">
            {pollResultsListWithOther?.map(resultWithOtherItem => {
              return (
                <PollResultItemOther
                  displayName={resultWithOtherItem.displayName}
                  isLoading={isLoading}
                  isUserVote={resultWithOtherItem.isOtherAnswer}
                  key={resultWithOtherItem.value}
                  percentage={resultWithOtherItem.percentage}
                  value={resultWithOtherItem.value}
                  votesInfo={resultWithOtherItem.votesInfo}
                />
              )
            })}
          </div>
        )}
      </div>
      <PollResultsVotesInfo totalPollVotes={totalPollVotes} />
      {!shouldHideVoteAgain && (
        <Button
          className="px-0 pt-4 hover:no-underline"
          disabled={isLoading}
          onClick={handleVoteAgain}
          variant="link"
        >
          <ReloadIcon className="mr-2 h-4 w-4 scale-x-[-1]" /> {userVotes ? 'Vote again' : 'Vote'}
        </Button>
      )}
    </div>
  )
}

const PollResultsVotesInfo = ({ totalPollVotes }: { totalPollVotes: number }) => {
  const votesInfo = pluralize({
    singular: `${totalPollVotes} vote`,
    plural: `${totalPollVotes} votes`,
    count: totalPollVotes,
  })

  if (!totalPollVotes) {
    return <p className="mt-2 text-sm text-gray-500">No votes yet</p>
  }

  return <p className="mt-2 text-sm text-gray-500">{votesInfo}</p>
}
