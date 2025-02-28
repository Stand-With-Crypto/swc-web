'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { EyeIcon } from 'lucide-react'

import { actionCreateUserActionPoll } from '@/actions/actionCreateUserActionPoll'
import { PollItem } from '@/components/app/pagePolls/pollItem'
import { PollLegend } from '@/components/app/pagePolls/pollLegend'
import { ProtectedSubmitButton } from '@/components/app/pagePolls/protectedSubmitButton'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { useSession } from '@/hooks/useSession'
import { SWCPoll } from '@/utils/shared/getSWCPolls'

interface ActivePollProps {
  activePoll: SWCPoll
  handleShowResults: () => void
  pollsResults: Record<string, PollResultsDataResponse>
  userPolls: PollsVotesFromUserResponse | undefined
  isLoading: boolean
  shouldHideVotes?: boolean
}

export function ActivePoll({
  activePoll,
  handleShowResults,
  pollsResults,
  userPolls,
  isLoading,
  shouldHideVotes,
}: ActivePollProps) {
  const {
    id: pollId,
    data: { pollTitle, allowOther, maxNumberOptionsSelected, endDate, pollList },
  } = activePoll

  const maxNumberOfOptions = maxNumberOptionsSelected ?? 0
  const isMultiple = maxNumberOfOptions === 0 || maxNumberOfOptions > 1

  const { isLoggedIn } = useSession()
  const [isInternalLoading, setIsInternalLoading] = useState(isLoading)

  const defaultValues = useMemo(() => {
    const currentPollData = userPolls?.pollVote[pollId]

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
  }, [pollId, userPolls?.pollVote])

  const totalPollVotes = useMemo(
    () =>
      pollsResults[pollId]?.computedAnswers.reduce(
        (acc: number, curr: any) => acc + curr.totalVotes,
        0,
      ),
    [pollId, pollsResults],
  )

  const form = useForm({
    defaultValues,
  })

  const { handleSubmit, control, reset, formState } = form

  const { isSubmitting } = formState

  const selectedAnswers = useWatch({ control, name: 'answers' })

  const isFormDisabled =
    shouldHideVotes || isSubmitting || isInternalLoading || !(!isLoading && isLoggedIn)
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

      await actionCreateUserActionPoll(pollData).catch(error => {
        console.error('Error creating poll vote', error)
        setIsInternalLoading(false)

        return
      })

      setIsInternalLoading(false)

      return handleShowResults()
    },
    [pollId, handleShowResults],
  )

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    if (isInternalLoading !== isLoading) {
      setIsInternalLoading(isLoading)
    }
  }, [isLoading, isInternalLoading])

  const shouldShowViewResults =
    !isInternalLoading && !shouldHideVotes && isLoggedIn && totalPollVotes > 0
  const hasUserVoted = typeof userPolls?.pollVote[activePoll?.id ?? ''] !== 'undefined'
  const shouldShowVoteInfo = !isFormDisabled && !hasUserVoted

  return (
    <div className="p-4">
      <PollLegend endDate={endDate} />
      <PageSubTitle
        as="h3"
        className="mb-4 mt-2 text-left text-foreground"
        size="lg"
        withoutBalancer
      >
        {pollTitle}
      </PageSubTitle>
      <PollSubtitle isMultiple={isMultiple} maxNumberOfOptions={maxNumberOfOptions} />
      <Form {...form}>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          {activePollItems.map(pollItem => {
            return (
              <PollItem
                displayName={pollItem.displayName}
                isFormDisabled={isFormDisabled}
                isMultiple={isMultiple}
                key={pollItem.value}
                maxNumberOfOptions={maxNumberOfOptions}
                value={pollItem.value}
              />
            )
          })}
          {allowOther && (
            <PollItem
              displayName="Other"
              isFormDisabled={isFormDisabled}
              isMultiple={isMultiple}
              maxNumberOfOptions={maxNumberOfOptions}
              shouldShowOtherField={allowOther}
              value="other"
            />
          )}
          <ProtectedSubmitButton isDisabled={isSubmitDisabled} isMultiple={isMultiple} />
        </form>
      </Form>
      {shouldShowVoteInfo && (
        <PollVotesInfo isMultiple={isMultiple} totalPollVotes={totalPollVotes} />
      )}
      {shouldShowViewResults && (
        <Button
          className="px-0 pt-4 hover:no-underline"
          disabled={isFormDisabled}
          onClick={handleShowResults}
          variant="link"
        >
          <EyeIcon className="mr-2 h-4 w-4" /> {isMultiple ? 'View results' : 'View result'}
        </Button>
      )}
    </div>
  )
}

const PollSubtitle = ({
  isMultiple,
  maxNumberOfOptions,
}: {
  isMultiple: boolean
  maxNumberOfOptions: number
}) => {
  if (!isMultiple) return null

  return (
    <div className="mb-3 text-sm text-gray-600">
      {maxNumberOfOptions === 0
        ? 'Select all that apply'
        : `Select up to ${maxNumberOfOptions} options`}
    </div>
  )
}

const PollVotesInfo = ({
  totalPollVotes,
  isMultiple,
}: {
  totalPollVotes: number
  isMultiple: boolean
}) => {
  return (
    <p className="mt-2 text-sm text-gray-500">
      {totalPollVotes
        ? `${totalPollVotes} votes • Vote to see ${isMultiple ? 'results' : 'result'}`
        : `Vote to see ${isMultiple ? 'results' : 'result'}`}
    </p>
  )
}
