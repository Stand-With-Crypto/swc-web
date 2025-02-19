'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { differenceInDays, format, isPast } from 'date-fns'
import Cookies from 'js-cookie'
import { EyeIcon } from 'lucide-react'

import { actionCreatePollVote } from '@/actions/actionCreatePollVote'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { PollItem, PollItemOther } from '@/components/app/pagePolls/pollItem'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { useDialog } from '@/hooks/useDialog'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { SWCPoll } from '@/utils/shared/getSWCPolls'
import { isValidCountryCode } from '@/utils/shared/isValidCountryCode'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

interface PollsProps {
  activePoll: SWCPoll
  isVoteAgain: boolean
  handleShowResults: () => void
  pollsResultsData: Record<string, PollResultsDataResponse>
  userPollsData: PollsVotesFromUserResponse | undefined
  isLoading: boolean
}

function SubmitButton({ isSubmitDisabled }: { isSubmitDisabled: boolean }) {
  const dialogProps = useDialog({ analytics: 'Active Poll Submit Button' })

  const userCountryCode = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)
  const isValid = isValidCountryCode({
    countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
    userCountryCode,
    bypassCountryCheck: false,
  })

  const setDialogOpen = (open: boolean) => {
    dialogProps.onOpenChange(open)
  }

  return (
    <LoginDialogWrapper
      authenticatedContent={
        isValid ? (
          <Button disabled={isSubmitDisabled} size="lg" type="submit" variant="primary-cta">
            Submit
          </Button>
        ) : (
          <Dialog {...dialogProps} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isSubmitDisabled} size="lg" variant="primary-cta">
                Submit
              </Button>
            </DialogTrigger>
            <DialogContent a11yTitle="Active Poll Submit Button" className="max-w-l w-full">
              <DialogBody>
                <UserActionFormActionUnavailable />
              </DialogBody>
            </DialogContent>
          </Dialog>
        )
      }
      bypassCountryCheck={false}
    >
      <Button disabled={isSubmitDisabled} size="lg" variant="primary-cta">
        Submit
      </Button>
    </LoginDialogWrapper>
  )
}

export function ActivePoll({
  activePoll,
  isVoteAgain,
  handleShowResults,
  pollsResultsData,
  userPollsData,
  isLoading,
}: PollsProps) {
  const {
    id: pollId,
    data: { pollTitle, multiple, allowOther, maxNumberOptionsSelected = 0, endDate, pollList },
  } = activePoll

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

  const { handleSubmit, watch, setValue, reset, formState } = form

  const { isSubmitting } = formState

  const selectedAnswers = watch('answers')
  const isOtherSelected =
    selectedAnswers &&
    (Array.isArray(selectedAnswers)
      ? selectedAnswers.includes('other')
      : selectedAnswers === 'other')

  const isFormDisabled = isSubmitting || isInternalLoading
  const isSubmitDisabled = isFormDisabled || selectedAnswers.length < 1

  const isOtherFieldDisabled =
    (maxNumberOptionsSelected > 0 &&
      selectedAnswers.length >= maxNumberOptionsSelected &&
      !selectedAnswers.includes('other')) ||
    isFormDisabled

  const activePollItems = useMemo(
    () =>
      pollList.map(option => {
        const isChecked = selectedAnswers?.includes(option.value)
        const isDisabled =
          (maxNumberOptionsSelected > 0 &&
            selectedAnswers.length >= maxNumberOptionsSelected &&
            !isChecked) ||
          isFormDisabled

        return {
          isChecked,
          isDisabled,
          value: option.value,
          displayName: option.displayName,
        }
      }),
    [isFormDisabled, maxNumberOptionsSelected, pollList, selectedAnswers],
  )

  const endsIn = differenceInDays(new Date(endDate), new Date())
  const hasEnded = isPast(new Date(endDate))
  const endDisclaimerText = hasEnded
    ? `Ended on ${format(new Date(endDate), 'MMM d, yyyy')}`
    : `Ends in ${endsIn} days`

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
    if (!isOtherSelected) {
      setValue('otherValue', '')
    }
  }, [isOtherSelected, setValue])

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    if (isInternalLoading !== isLoading) {
      setIsInternalLoading(isLoading)
    }
  }, [isLoading, isInternalLoading])

  if (!activePoll) {
    return <div className="p-4">No active poll available</div>
  }

  return (
    <div className="p-4">
      <span className="text-sm text-gray-500">
        {endsIn === 0 ? 'Ends today' : endDisclaimerText}
      </span>
      <h2 className="mb-3 mt-2 text-xl leading-5">{pollTitle}</h2>

      {multiple && (
        <div className="mb-3 text-sm text-gray-600">
          {maxNumberOptionsSelected <= 0
            ? 'Select all that apply'
            : `Select up to ${maxNumberOptionsSelected} options`}
        </div>
      )}

      <Form {...form}>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          {activePollItems.map(pollItem => {
            return <PollItem key={pollItem.value} multiple={multiple} {...pollItem} />
          })}

          {allowOther && (
            <PollItemOther
              displayName="Other"
              isChecked={isOtherSelected}
              isDisabled={isOtherFieldDisabled}
              isOtherFieldDisabled={isOtherFieldDisabled}
              isOtherSelected={isOtherSelected}
              multiple={multiple}
              value="other"
            />
          )}

          <SubmitButton isSubmitDisabled={isSubmitDisabled} />
        </form>
      </Form>

      <p className="mt-2 text-sm text-gray-500">{totalPollVotes} votes • Vote to see result</p>

      <Button
        className="px-0 pt-4 hover:no-underline"
        disabled={formState.isSubmitting || isInternalLoading}
        onClick={handleShowResults}
        variant="link"
      >
        <EyeIcon className="mr-2 h-4 w-4" /> View results
      </Button>
    </div>
  )
}
