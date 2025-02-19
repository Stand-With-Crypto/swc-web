'use client'

import { useMemo } from 'react'
import { ReloadIcon } from '@radix-ui/react-icons'
import { differenceInDays, format, isPast } from 'date-fns'

import { Button } from '@/components/ui/button'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

import { PollResultItem, PollResultItemOther } from './pollResultItem'

interface PollResultsProps {
  currentPoll: SWCPoll
  pollsResultsData: Record<string, PollResultsDataResponse>
  userPollsData: PollsVotesFromUserResponse | undefined
  isLoading: boolean
  handleVoteAgain?: () => void
  hideVoteAgain?: boolean
  inactivePoll?: boolean
}

function getPercentage(totalVotes: number, optionVotes: number) {
  return totalVotes ? ((optionVotes || 0) / totalVotes) * 100 : 0
}

export function PollResults({
  currentPoll,
  pollsResultsData,
  userPollsData,
  isLoading,
  handleVoteAgain,
  hideVoteAgain,
  inactivePoll,
}: PollResultsProps) {
  const {
    id: pollId,
    data: { pollTitle, multiple, allowOther, endDate, pollList },
  } = currentPoll

  const userVotes = userPollsData?.pollVote[pollId]

  const endsIn = differenceInDays(new Date(endDate), new Date())
  const hasEnded = isPast(new Date(endDate))
  const endDisclaimerText = hasEnded
    ? `Ended on ${format(new Date(endDate), 'MMM d, yyyy')}`
    : `Ends in ${endsIn} days`

  const totalPollVotes = useMemo(
    () =>
      pollsResultsData[pollId]?.computedAnswers.reduce(
        (acc: number, curr: any) => acc + curr.totalVotes,
        0,
      ),
    [pollId, pollsResultsData],
  )

  const pollResultsList = useMemo(
    () =>
      pollList.map(option => {
        const optionData = pollsResultsData[pollId]?.computedAnswers.find(
          (answer: any) => answer.answer === option.value,
        )

        const percentage = getPercentage(totalPollVotes, optionData?.totalVotes || 0)
        const isUserVote =
          typeof userVotes?.answers.find(answer => answer.answer === option.value) !== 'undefined'
        const totalAbsoluteVotes = optionData?.totalVotes ?? 0

        const votesInfo = multiple ? `${totalAbsoluteVotes} votes` : `${percentage.toFixed(0)}%`

        return {
          votesInfo,
          value: option.value,
          displayName: option.displayName,
          isUserVote,
          totalAbsoluteVotes,
          percentage,
        }
      }),
    [pollList, pollsResultsData, pollId, totalPollVotes, userVotes, multiple],
  )

  const pollResultsListWithOther = useMemo(
    () =>
      pollsResultsData[pollId]?.computedAnswersWithOther
        .filter(answer => !pollList.find(option => option.value === answer.answer))
        .map(otherAnswer => {
          const percentage = getPercentage(totalPollVotes, otherAnswer.totalVotes || 0)
          const isOtherAnswer =
            typeof userVotes?.answers.find(answer => answer.isOtherAnswer) !== 'undefined'
          const totalAbsoluteVotes = otherAnswer?.totalVotes ?? 0

          const votesInfo = multiple ? `${totalAbsoluteVotes} votes` : `${percentage.toFixed(0)}%`

          return {
            votesInfo,
            value: otherAnswer.answer,
            displayName: 'Other',
            isOtherAnswer,
            totalAbsoluteVotes,
            percentage,
          }
        }),
    [multiple, pollId, pollList, pollsResultsData, totalPollVotes, userVotes?.answers],
  )

  return (
    <div className="p-4">
      <span className="text-sm text-gray-500">
        {endsIn === 0 ? `${inactivePoll ? 'Ended' : 'Ends'} today` : endDisclaimerText}
      </span>
      <h2 className="mb-4 mt-2 text-xl leading-5">{pollTitle}</h2>

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

      {totalPollVotes && <p className="mt-2 text-sm text-gray-500">{totalPollVotes} votes</p>}

      {!hideVoteAgain && (
        <Button className="px-0 pt-4 hover:no-underline" onClick={handleVoteAgain} variant="link">
          <ReloadIcon className="mr-2 h-4 w-4 scale-x-[-1]" /> {userVotes ? 'Vote again' : 'Vote'}
        </Button>
      )}
    </div>
  )
}
