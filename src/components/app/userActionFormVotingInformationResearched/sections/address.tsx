import { useCallback, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { actionCreateUserActionVotingInformationResearched } from '@/actions/actionCreateUserActionVotingInformationResearched'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { buildElectoralUrl } from '@/components/app/userActionFormVotingInformationResearched/utils'
import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/errorMessage'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIsMobile } from '@/hooks/useIsMobile'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import { zodAddress } from '@/validation/fields/zodAddress'

import {
  FORM_NAME,
  votingInformationResearchedFormValidationSchema,
  VotingInformationResearchedFormValues,
} from './formConfig'

export interface AddressProps {
  onSuccess: (address: z.infer<typeof zodAddress>) => void
  onSubmit?: () => void
  initialValues?: Partial<VotingInformationResearchedFormValues>
}

export function Address(props: AddressProps) {
  const { onSuccess, initialValues } = props

  const router = useRouter()

  const form = useForm<VotingInformationResearchedFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(votingInformationResearchedFormValidationSchema),
  })

  const addressField = useWatch({
    control: form.control,
    name: 'address',
    defaultValue: initialValues?.address || {
      description: '',
      place_id: '',
    },
  })

  const isMobile = useIsMobile({ defaultState: true })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const error = form.formState.errors?.root
  const errorRef = useRef(error)

  useEffect(() => {
    if (!isMobile && !errorRef.current && !initialValues?.address) {
      inputRef.current?.click()
    }
  }, [form, isMobile, initialValues])

  const { mutate } = useApiResponseForUserFullProfileInfo()

  const createAction = useCallback(
    async (formValues: VotingInformationResearchedFormValues) => {
      const address = await convertGooglePlaceAutoPredictionToAddressSchema(
        formValues.address,
      ).catch(e => {
        Sentry.captureException(e)
        catchUnexpectedServerErrorAndTriggerToast(e)
        return null
      })
      if (!address) {
        form.setError('root', {
          message: 'Invalid address',
        })
        return
      }
      const result = await triggerServerActionForForm(
        {
          form,
          formName: FORM_NAME,
          analyticsProps: {
            ...(address ? convertAddressToAnalyticsProperties(address) : {}),
            'Campaign Name': formValues.campaignName,
            'User Action Type': UserActionType.VOTING_INFORMATION_RESEARCHED,
            'Subscribed to notifications': formValues.shouldReceiveNotifications,
          },
          payload: { ...formValues, address },
          onError: toastGenericError,
        },
        payload =>
          actionCreateUserActionVotingInformationResearched(payload).then(
            async actionResultPromise => {
              const actionResult = await actionResultPromise
              if (actionResult && 'user' in actionResult && actionResult.user) {
                identifyUserOnClient(actionResult.user)
              }
              return actionResult
            },
          ),
      )
      if (result.status === 'success') {
        onSuccess(address)
        void mutate()
        router.refresh()
        const url = buildElectoralUrl(address)
        return url.toString()
      }
    },
    [form, mutate, onSuccess, router],
  )

  return (
    <UserActionFormLayout>
      <div className="flex h-full flex-1 flex-col">
        <div className="space-y-6">
          <p className="text-center text-2xl font-semibold">Prepare to vote</p>
          <p className="text-center text-fontcolor-muted">
            Find your polling location and check to see if there are early voting options in your
            district.
          </p>

          <div className="mx-auto w-full max-w-lg">
            <Form {...form}>
              <form
                id="view-key-races-form"
                onSubmit={form.handleSubmit(formValues => {
                  const windowRef = window.open()
                  void createAction(formValues).then(url => {
                    if (url && windowRef) {
                      windowRef.location = url
                    }
                  })
                }, trackFormSubmissionSyncErrors(FORM_NAME))}
              >
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl aria-invalid={!!error}>
                        <GooglePlacesSelect
                          {...field}
                          className="rounded-full bg-secondary"
                          onChange={newAddress => {
                            form.clearErrors('root')
                            field.onChange(newAddress)
                          }}
                          placeholder="Your full address"
                          ref={inputRef}
                          value={field.value}
                          variant="lg"
                        />
                      </FormControl>
                      {!!error && <ErrorMessage>{error?.message}</ErrorMessage>}
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        <Button
          className="mx-auto mt-auto"
          disabled={form.formState.isSubmitting || !addressField?.place_id}
          form="view-key-races-form"
          size="lg"
          type="submit"
        >
          {form.formState.isSubmitting ? 'Loading...' : 'Check your voting information'}
        </Button>
      </div>
    </UserActionFormLayout>
  )
}
