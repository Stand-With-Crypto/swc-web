'use client'
import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionViewKeyRaces,
  CreateActionViewKeyRacesInput,
} from '@/actions/actionCreateUserActionViewKeyRaces'
import { ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED } from '@/components/app/pageVoterGuide/constants/us/usCtas'
import {
  voterGuideFormValidationSchema,
  VoterGuideFormValues,
} from '@/components/app/pageVoterGuide/formConfig'
import { KeyRacesList, KeyRacesSkeleton } from '@/components/app/pageVoterGuide/keyRacesList'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { useRacesByAddress } from '@/components/app/userActionFormVoterAttestation/useRacesByAddress'
import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { ErrorMessage } from '@/components/ui/errorMessage'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import { useIsMobile } from '@/hooks/useIsMobile'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns/index'
import { cn } from '@/utils/web/cn'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'

interface KeyRacesFormProps {
  onSubmit?: (formData: VoterGuideFormValues) => Promise<void>
  onViewKeyRacesActionSuccess?: () => void
  initialValues?: VoterGuideFormValues
}

export function KeyRacesForm({
  onSubmit,
  initialValues,
  onViewKeyRacesActionSuccess,
}: KeyRacesFormProps) {
  const router = useRouter()

  const { mutate } = useApiResponseForUserPerformedUserActionTypes()

  const form = useForm<VoterGuideFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(voterGuideFormValidationSchema),
  })

  const isMobile = useIsMobile({ defaultState: true })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const addressError = form.formState.errors?.address
  const errorRef = useRef(addressError)
  const countryCode = useCountryCode()

  useEffect(() => {
    if (!isMobile && !errorRef.current && !initialValues?.address) {
      inputRef.current?.click()
    }
  }, [form, isMobile, initialValues])

  const address = useWatch({
    control: form.control,
    name: 'address',
    defaultValue: initialValues?.address || {
      description: '',
      place_id: '',
    },
  })

  const racesByAddressRequest = useRacesByAddress(address?.description, {
    onError: (error: Error) => {
      form.setError('address', {
        message: error.message,
      })
    },
    onSuccess: () => {
      form.clearErrors('address')
    },
  })

  const createViewKeyRacesAction = async () => {
    const formValues = form.getValues()
    if (!formValues.address) return

    const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(
      formValues.address,
    ).catch(e => {
      Sentry.captureException(e)
      catchUnexpectedServerErrorAndTriggerToast(e)
      return null
    })
    if (!addressSchema) {
      form.setError('address', {
        message: 'Invalid address',
      })
      return
    }
    const payload: CreateActionViewKeyRacesInput = {
      address: addressSchema,
      usCongressionalDistrict: addressSchema?.usCongressionalDistrict,
      usaState: addressSchema?.administrativeAreaLevel1,
      campaignName: getActionDefaultCampaignName(UserActionType.VIEW_KEY_RACES, countryCode),
      shouldBypassAuth: true,
      countryCode,
    }
    const result = await triggerServerActionForForm(
      {
        form,
        formName: ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED,
        analyticsProps: {
          ...(addressSchema ? convertAddressToAnalyticsProperties(addressSchema) : {}),
          'User Action Type': UserActionType.VIEW_KEY_RACES,
        },
        payload,
        onError: toastGenericError,
      },
      input =>
        actionCreateUserActionViewKeyRaces(input).then(async actionPromise => {
          const actionResult = await actionPromise
          if (actionResult && 'user' in actionResult && actionResult.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )
    if (result.status === 'success') {
      router.refresh()
      void mutate()
      onViewKeyRacesActionSuccess?.()
    }
  }
  const createViewKeyRacesActionRef = useRef(createViewKeyRacesAction)

  const scriptStatus = useGoogleMapsScript()

  useEffect(() => {
    if (address?.description && racesByAddressRequest.data && scriptStatus.isLoaded) {
      void createViewKeyRacesActionRef.current()
    }
  }, [address, racesByAddressRequest.data, scriptStatus])

  const isSubmitDisabled =
    form.formState.isSubmitting ||
    racesByAddressRequest.isLoading ||
    !racesByAddressRequest.data ||
    !address?.place_id ||
    !!addressError

  const onFormSubmit = async (formValues: VoterGuideFormValues) => {
    if (!racesByAddressRequest.data) {
      form.setError('address', {
        message: 'Invalid address',
      })
      return
    }
    await onSubmit?.(formValues)
  }

  return (
    <UserActionFormLayout>
      <div className="flex h-full flex-1 flex-col">
        <ScrollArea className="flex min-h-[70vh]  flex-1 flex-col overflow-auto md:max-h-[70vh]">
          <div className={cn(dialogContentPaddingStyles)}>
            <div className="space-y-6">
              <p className="text-center text-xl font-semibold">Get informed</p>
              <p className="text-center text-fontcolor-muted">
                See who's on your ballot and pledge to vote in this year's election.
              </p>

              <div className="mx-auto w-full max-w-lg">
                <Form {...form}>
                  <form
                    id="view-key-races-form"
                    onSubmit={form.handleSubmit(
                      onFormSubmit,
                      trackFormSubmissionSyncErrors(ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED),
                    )}
                  >
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl aria-invalid={!!addressError}>
                            <GooglePlacesSelect
                              {...field}
                              className="rounded-full bg-secondary"
                              onChange={newAddress => {
                                form.clearErrors('address')
                                field.onChange(newAddress)
                              }}
                              placeholder="Your full address"
                              ref={inputRef}
                              value={field.value}
                              variant="lg"
                            />
                          </FormControl>
                          {!!addressError && <ErrorMessage>{addressError?.message}</ErrorMessage>}
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col space-y-6 md:space-y-10">
            {racesByAddressRequest.isLoading ? (
              <KeyRacesSkeleton />
            ) : (
              <KeyRacesList races={racesByAddressRequest?.data} />
            )}
          </div>
        </ScrollArea>

        <div
          className="z-10 mt-auto flex flex-col items-center justify-center border border-t p-6 sm:flex-row md:px-12"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
        >
          <Button
            className="ml-auto min-w-[130px]"
            disabled={isSubmitDisabled}
            form="view-key-races-form"
            size="lg"
            type="submit"
          >
            I pledge to vote
          </Button>
        </div>
      </div>
    </UserActionFormLayout>
  )
}
