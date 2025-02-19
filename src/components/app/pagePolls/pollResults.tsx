'use client'

import { useMemo } from 'react'
import { ReloadIcon } from '@radix-ui/react-icons'
import { differenceInDays, format, isPast } from 'date-fns'
import { motion } from 'framer-motion'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { Button } from '@/components/ui/button'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

interface PollResultsProps {
  currentPoll: SWCPoll
  pollsResultsData: Record<string, PollResultsDataResponse>
  userPollsData: PollsVotesFromUserResponse | undefined
  isLoading: boolean
  handleVoteAgain?: () => void
  hideVoteAgain?: boolean
  inactivePoll?: boolean
}

function VoteItemLoading() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      className="absolute bottom-0 left-0 h-full w-full rounded-lg bg-purple-100"
      transition={{ duration: 1.2, repeat: Infinity }}
    />
  )
}

function BlankVoteInfo() {
  return (
    <motion.span
      animate={{ opacity: [0.8, 0.6, 0.4, 0.2, 0.4, 0.6, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      --
    </motion.span>
  )
}

function getPercentage(totalVotes: number, optionVotes: number) {
  return totalVotes ? ((optionVotes || 0) / totalVotes) * 100 : 0
}

function PercentageBar({ percentage }: { percentage: number }) {
  return (
    <motion.div
      animate={{ width: `${percentage}%` }}
      className="absolute bottom-0 left-0 h-full rounded-lg bg-purple-200"
      initial={{ width: '0%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    />
  )
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
        const isUserVote = userVotes?.answers.find(answer => answer.answer === option.value)
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
          const isOtherAnswer = userVotes?.answers.find(
            answer => answer.isOtherAnswer && answer.answer,
          )
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
            <div
              className="relative flex h-14 items-center justify-between px-4 py-2 font-medium"
              key={resultItem.value}
            >
              <span className="z-10">{resultItem.displayName}</span>
              <div className="z-10 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {isLoading ? <BlankVoteInfo /> : resultItem.votesInfo}
                </span>
                {!isLoading && resultItem.isUserVote && (
                  <div className="relative h-4 w-4">
                    <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
                  </div>
                )}
              </div>

              {isLoading ? (
                <VoteItemLoading />
              ) : (
                <PercentageBar percentage={resultItem.percentage} />
              )}
            </div>
          )
        })}

        {allowOther && (
          <div className="flex flex-col gap-2">
            {pollResultsListWithOther.map(resultWithOtherItem => {
              return (
                <div
                  className="relative flex h-14 items-center justify-between px-4 py-2 font-medium"
                  key={`other-${resultWithOtherItem.value}`}
                >
                  <span className="z-10 py-2">Other</span>
                  <div className="z-10 flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {isLoading ? <BlankVoteInfo /> : resultWithOtherItem.votesInfo}
                    </span>
                    {!isLoading && resultWithOtherItem.isOtherAnswer && (
                      <div className="relative h-4 w-4">
                        <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {isLoading ? (
                    <VoteItemLoading />
                  ) : (
                    <PercentageBar percentage={resultWithOtherItem.percentage} />
                  )}
                </div>
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
