'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { ContentSection } from '@/components/app/ContentSection'
import {
  DTSIPersonHeroCardSection,
  DTSIPersonHeroCardSectionProps,
} from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import {
  getDefaultValues,
  voterGuideFormValidationSchema,
  VoterGuideFormValues,
} from '@/components/app/pageVoterGuide/formConfig'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import { useRacesByAddress } from '@/components/app/userActionFormVoterAttestation/useRacesByAddress'
import { Button } from '@/components/ui/button'
import {
  dialogContentPaddingBottomStyles,
  dialogContentPaddingStyles,
  dialogContentPaddingXStyles,
} from '@/components/ui/dialog/styles'
import { ErrorMessage } from '@/components/ui/errorMessage'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLocale } from '@/hooks/useLocale'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { cn } from '@/utils/web/cn'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'

const ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED = 'User Action Form Get Informed'

interface KeyRacesDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
  initialValues?: VoterGuideFormValues
  defaultOpen?: boolean
}

export const KeyRacesDialog = (props: KeyRacesDialogProps) => {
  const { children, onSuccess, initialValues, defaultOpen } = props

  const router = useRouter()
  const locale = useLocale()

  const { data } = useApiResponseForUserFullProfileInfo()
  const user = data?.user

  const userDefaultValues = useMemo(() => getDefaultValues({ user }), [user])

  const form = useForm<VoterGuideFormValues>({
    defaultValues: {
      ...userDefaultValues,
      address: initialValues?.address || userDefaultValues.address,
    },
    resolver: zodResolver(voterGuideFormValidationSchema),
  })

  const isMobile = useIsMobile({ defaultState: true })
  const inputRef = useRef<HTMLInputElement | null>(null)

  const error = form.formState.errors?.address
  const errorRef = useRef(error)
  errorRef.current = error

  useEffect(() => {
    if (!isMobile && !errorRef.current) {
      inputRef.current?.click()
    }
  }, [form, isMobile])

  const address = useWatch({
    control: form.control,
    name: 'address',
  })

  const racesByAddressRequest = useRacesByAddress(address?.description)
  const { congressional, senate, presidential, stateCode, districtNumber } =
    racesByAddressRequest?.data ?? {}

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED,
  })

  const dtsiPersonHeroCardSectionProps: Pick<
    DTSIPersonHeroCardSectionProps,
    'forceMobile' | 'locale' | 'titleProps' | 'target'
  > = {
    forceMobile: true,
    locale: locale,
    titleProps: {
      size: 'xs',
    },
    target: '_blank',
  }

  return (
    <UserActionFormDialog {...dialogProps} padding={false} trigger={children}>
      <UserActionFormLayout>
        <div className="flex h-full flex-1 flex-col">
          <ScrollArea className="overflow-auto md:max-h-[70vh]">
            <div className={cn(dialogContentPaddingStyles)}>
              <div className="space-y-6">
                <p className="text-center text-xl font-semibold">
                  See where politicians in your area stand on crypto
                </p>

                <div className="mx-auto w-full max-w-lg">
                  <Form {...form}>
                    <form
                      id="view-key-races-form"
                      onSubmit={form.handleSubmit(async values => {
                        const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(
                          values.address,
                        ).catch(e => {
                          Sentry.captureException(e)
                          catchUnexpectedServerErrorAndTriggerToast(e)
                          return null
                        })
                        if (!address) {
                          return
                        }
                        const result = await triggerServerActionForForm(
                          {
                            form,
                            formName: ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED,
                            analyticsProps: {
                              ...(addressSchema
                                ? convertAddressToAnalyticsProperties(addressSchema)
                                : {}),
                              'User Action Type': UserActionType.VIEW_KEY_RACES,
                            },
                            payload: {
                              ...values,
                              usCongressionalDistrict: addressSchema?.usCongressionalDistrict,
                              usaState: stateCode,
                            },
                            onError: (_, e) => {
                              form.setError('address', {
                                message: e.message,
                              })
                              toastGenericError()
                            },
                          },
                          payload =>
                            actionCreateUserActionViewKeyRaces(payload).then(actionResult => {
                              if (actionResult && 'user' in actionResult && actionResult.user) {
                                identifyUserOnClient(actionResult.user)
                              }
                              return actionResult
                            }),
                        )
                        if (result.status === 'success') {
                          router.refresh()
                          onSuccess?.()
                        }
                      }, trackFormSubmissionSyncErrors(ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED))}
                    >
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl aria-invalid={!!error}>
                              <GooglePlacesSelect
                                {...field}
                                className="h-14 rounded-full bg-secondary"
                                placeholder="Your full address"
                                ref={inputRef}
                                value={field.value}
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
            </div>

            <div className="space-y-6 md:space-y-10">
              {racesByAddressRequest.isLoading ? (
                <KeyRacesSkeleton />
              ) : (
                <>
                  {!!presidential && presidential?.length > 0 && (
                    <RaceSectionWrapper>
                      <DTSIPersonHeroCardSection
                        {...dtsiPersonHeroCardSectionProps}
                        people={presidential}
                        title="Presidential Election"
                      />
                    </RaceSectionWrapper>
                  )}

                  {!!senate && senate?.length > 0 && (
                    <>
                      <hr />
                      <RaceSectionWrapper>
                        <DTSIPersonHeroCardSection
                          {...dtsiPersonHeroCardSectionProps}
                          people={senate}
                          title={`U.S. Senate Race${stateCode ? ` (${stateCode})` : ''}`}
                        />
                      </RaceSectionWrapper>
                    </>
                  )}

                  {!!congressional && congressional?.length > 0 && (
                    <>
                      <hr />
                      <RaceSectionWrapper className={dialogContentPaddingBottomStyles}>
                        <DTSIPersonHeroCardSection
                          {...dtsiPersonHeroCardSectionProps}
                          people={congressional}
                          title={`Congressional District${districtNumber ? ` ${districtNumber}` : ''}`}
                        />
                      </RaceSectionWrapper>
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          <div
            className="z-10 mt-auto flex flex-col items-center justify-center border border-t p-6 sm:flex-row md:px-12"
            style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
          >
            <Button
              className="ml-auto min-w-[130px]"
              disabled={
                form.formState.isSubmitting ||
                racesByAddressRequest.isLoading ||
                !form.formState.isValid
              }
              form="view-key-races-form"
              size="lg"
              type="submit"
            >
              Done
            </Button>
          </div>
        </div>
      </UserActionFormLayout>
    </UserActionFormDialog>
  )
}

function RaceSectionWrapper({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn(dialogContentPaddingXStyles, className)}>
      <div className={'mx-auto flex max-w-md flex-col gap-6 md:gap-10'}>{children}</div>
    </div>
  )
}

function KeyRacesSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <ContentSection
        className="w-full max-w-sm"
        title="Presidential Election"
        titleProps={{
          size: 'xs',
        }}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-36 w-full rounded-3xl" key={index} />
        ))}
      </ContentSection>

      <ContentSection
        className="w-full max-w-sm"
        title="U.S. Senate Race"
        titleProps={{
          size: 'xs',
        }}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-36 w-full rounded-3xl" key={index} />
        ))}
      </ContentSection>

      <ContentSection
        className="w-full max-w-sm"
        title="Congressional District"
        titleProps={{
          size: 'xs',
        }}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-36 w-full rounded-3xl" key={index} />
        ))}
      </ContentSection>
    </div>
  )
}
