'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { differenceInDays } from 'date-fns'
import Cookies from 'js-cookie'
import { EyeIcon } from 'lucide-react'

import { actionCreatePollVote } from '@/actions/actionCreatePollVote'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PollResultsDataResponse, PollsVotesFromUserResponse } from '@/data/polls/getPollsData'
import { useDialog } from '@/hooks/useDialog'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { SWCPoll } from '@/utils/shared/getSWCPolls'
import { isValidCountryCode } from '@/utils/shared/isValidCountryCode'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

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
  const [isInternalLoading, setIsInternalLoading] = useState(isLoading)

  const {
    id: pollId,
    data: { pollTitle, multiple, allowOther, maxNumberOptionsSelected = 0, endDate, pollList },
  } = activePoll

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

  const { register, handleSubmit, watch, setValue, reset, formState } = useForm({
    defaultValues,
  })

  const { isSubmitting } = formState

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

  const selectedAnswers = watch('answers')
  const isOtherSelected =
    selectedAnswers &&
    (Array.isArray(selectedAnswers)
      ? selectedAnswers.includes('other')
      : selectedAnswers === 'other')

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

  const isFormDisabled = isSubmitting || isInternalLoading
  const isSubmitDisabled = isFormDisabled || selectedAnswers.length < 1

  const isOtherFieldDisabled =
    (maxNumberOptionsSelected > 0 &&
      selectedAnswers.length >= maxNumberOptionsSelected &&
      !selectedAnswers.includes('other')) ||
    isFormDisabled

  const endsIn = differenceInDays(new Date(endDate), new Date())

  return (
    <div className="p-4">
      <span className="text-sm text-gray-500">Ends in {endsIn} days</span>
      <h2 className="mb-3 mt-2 text-xl leading-5">{pollTitle}</h2>

      {multiple && (
        <div className="mb-3 text-sm text-gray-600">
          {maxNumberOptionsSelected === 0
            ? 'Select all that apply'
            : `Select up to ${maxNumberOptionsSelected} options`}
        </div>
      )}

      <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        {pollList.map((option, optionIndex) => {
          const isChecked = selectedAnswers?.includes(option.value)
          const isDisabled =
            (maxNumberOptionsSelected > 0 &&
              selectedAnswers.length >= maxNumberOptionsSelected &&
              !isChecked) ||
            isFormDisabled

          return (
            <Label
              className={cn(
                'flex h-14 cursor-pointer items-center justify-between rounded-2xl bg-gray-100 px-4 py-2 text-base font-medium leading-6 text-muted-foreground hover:bg-gray-200',
                isChecked && 'text-foreground',
                isDisabled && 'hover:none cursor-default',
              )}
              key={optionIndex}
            >
              <div className="flex items-center gap-4">
                <Input
                  className={multiple ? 'h-5 w-5 cursor-pointer' : 'hidden'}
                  {...register('answers')}
                  disabled={isDisabled}
                  type={multiple ? 'checkbox' : 'radio'}
                  value={option.value}
                />
                <span>{option.displayName}</span>
              </div>
              {isChecked && (
                <div className="relative h-4 w-4">
                  <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
                </div>
              )}
            </Label>
          )
        })}

        {allowOther && (
          <label
            className={cn(
              'flex h-auto min-h-14 cursor-pointer flex-col justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-base font-medium leading-6 text-muted-foreground hover:bg-gray-200',
              isOtherSelected && 'text-foreground',
              isOtherFieldDisabled && 'hover:none cursor-default',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  type={multiple ? 'checkbox' : 'radio'}
                  {...register('answers')}
                  className="h-5 w-5 cursor-pointer"
                  disabled={isOtherFieldDisabled}
                  value="other"
                />
                <span className="py-2">Other</span>
              </div>
              {isOtherSelected && (
                <div className="relative h-4 w-4">
                  <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
                </div>
              )}
            </div>
            {isOtherSelected && (
              <Input
                className="w-full rounded-lg border px-4 py-2 focus:border-gray-400 focus:outline-none"
                {...register('otherValue')}
                disabled={isOtherFieldDisabled}
                placeholder="Please specify"
                type="text"
              />
            )}
          </label>
        )}

        <SubmitButton isSubmitDisabled={isSubmitDisabled} />
      </form>

      <p className="mt-2 text-sm text-gray-500">
        {pollsResultsData[pollId]?.computedAnswers.reduce(
          (acc: number, curr: any) => acc + curr.totalVotes,
          0,
        )}{' '}
        votes • Vote to see result
      </p>

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
