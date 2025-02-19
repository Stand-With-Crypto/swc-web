'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { differenceInDays, format, isPast } from 'date-fns'
import { EyeIcon } from 'lucide-react'

import { actionCreatePollVote } from '@/actions/actionCreatePollVote'
import { PollItem } from '@/components/app/pagePolls/pollItem'
import { ProtectedSubmitButton } from '@/components/app/pagePolls/protectedSubmitButton'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { useSession } from '@/hooks/useSession'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

interface ActivePollProps {
  activePoll: SWCPoll
  isVoteAgain: boolean
  handleShowResults: () => void
  pollsResultsData: Record<string, PollResultsDataResponse>
  userPollsData: PollsVotesFromUserResponse | undefined
  isLoading: boolean
}

export function ActivePoll({
  activePoll,
  isVoteAgain,
  handleShowResults,
  pollsResultsData,
  userPollsData,
  isLoading,
}: ActivePollProps) {
  const {
    id: pollId,
    data: { pollTitle, multiple, allowOther, maxNumberOptionsSelected = 0, endDate, pollList },
  } = activePoll

  const { isLoggedIn } = useSession()
  const [isInternalLoading, setIsInternalLoading] = useState(isLoading)

  const defaultValues = useMemo(() => {
    const currentPollData = userPollsData?.pollVote[pollId]

    if (!currentPollData) {
      return {
        answers: [],
        otherValue: '',
      }
    }

    return {
      answers:
        currentPollData?.answers
          .map(currentAnswer =>
            !currentAnswer.isOtherAnswer && currentAnswer.answer ? currentAnswer.answer : 'other',
          )
          .filter(Boolean) ?? [],
      otherValue:
        currentPollData?.answers.find(currentOtherAnswer => currentOtherAnswer.isOtherAnswer)
          ?.answer ?? '',
    }
  }, [pollId, userPollsData?.pollVote])

  const totalPollVotes = useMemo(
    () =>
      pollsResultsData[pollId]?.computedAnswers.reduce(
        (acc: number, curr: any) => acc + curr.totalVotes,
        0,
      ),
    [pollId, pollsResultsData],
  )

  const form = useForm({
    defaultValues,
  })

  const { handleSubmit, control, reset, formState } = form

  const { isSubmitting } = formState

  const selectedAnswers = useWatch({ control, name: 'answers' })

  const isFormDisabled = isSubmitting || isInternalLoading
  const isSubmitDisabled = isFormDisabled || selectedAnswers.length < 1

  const activePollItems = useMemo(
    () =>
      pollList.map(option => {
        return {
          value: option.value,
          displayName: option.displayName,
        }
      }),
    [pollList],
  )

  const endsIn = differenceInDays(new Date(endDate), new Date())
  const hasEnded = isPast(new Date(endDate))
  const endDisclaimerText = hasEnded
    ? `Ended on ${format(new Date(endDate), 'MMM d, yyyy')}`
    : `Ends in ${endsIn} days`

  const pollSubtitleText = multiple && (
    <div className="mb-3 text-sm text-gray-600">
      {maxNumberOptionsSelected <= 0
        ? 'Select all that apply'
        : `Select up to ${maxNumberOptionsSelected} options`}
    </div>
  )

  const onSubmit = useCallback(
    async (formData: { answers: string[]; otherValue: string }) => {
      const { answers, otherValue } = formData

      const answersArray = Array.isArray(answers) ? answers : [answers]
      const formattedAnswers = answersArray.filter(Boolean).map((answer: string) => {
        const isOtherAnswer = answer === 'other'
        return { answer: isOtherAnswer ? otherValue : answer, isOtherAnswer }
      })

      const pollData = {
        campaignName: pollId,
        answers: formattedAnswers,
      }

      setIsInternalLoading(true)

      await actionCreatePollVote(pollData, isVoteAgain).catch(error => {
        console.error('Error creating poll vote', error)
        setIsInternalLoading(false)

        return
      })

      setIsInternalLoading(false)

      return handleShowResults()
    },
    [pollId, handleShowResults, isVoteAgain],
  )

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    if (isInternalLoading !== isLoading) {
      setIsInternalLoading(isLoading)
    }
  }, [isLoading, isInternalLoading])

  return (
    <div className="p-4">
      <span className="text-sm text-gray-500">
        {endsIn === 0 ? 'Ends today' : endDisclaimerText}
      </span>
      <h2 className="mb-3 mt-2 text-xl leading-5">{pollTitle}</h2>

      {pollSubtitleText}

      <Form {...form}>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          {activePollItems.map(pollItem => {
            return (
              <PollItem
                displayName={pollItem.displayName}
                isFormDisabled={isFormDisabled}
                key={pollItem.value}
                maxNumberOptionsSelected={maxNumberOptionsSelected}
                multiple={multiple}
                value={pollItem.value}
              />
            )
          })}

          {allowOther && (
            <PollItem
              displayName="Other"
              isFormDisabled={isFormDisabled}
              maxNumberOptionsSelected={maxNumberOptionsSelected}
              multiple={multiple}
              showOtherField={allowOther}
              value="other"
            />
          )}

          <ProtectedSubmitButton isDisabled={isSubmitDisabled} />
        </form>
      </Form>

      <p className="mt-2 text-sm text-gray-500">{totalPollVotes} votes • Vote to see result</p>

      {!isLoading && isLoggedIn && (
        <Button
          className="px-0 pt-4 hover:no-underline"
          disabled={formState.isSubmitting || isInternalLoading}
          onClick={handleShowResults}
          variant="link"
        >
          <EyeIcon className="mr-2 h-4 w-4" /> View results
        </Button>
      )}
    </div>
  )
}
