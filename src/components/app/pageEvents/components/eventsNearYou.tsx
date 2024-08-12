'use client'

import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Balancer from 'react-wrap-balancer'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/nextjs'
import { isAfter } from 'date-fns'
import { useRouter } from 'next/navigation'
import { object, z } from 'zod'

import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { EventCard } from '@/components/app/pageEvents/components/eventCard'
import { EventCardSkeleton } from '@/components/app/pageEvents/components/eventCardSkeleton'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormErrorMessage, FormField, FormItem } from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { GenericErrorFormValues, triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

interface EventsNearYouProps {
  events: SWCEvents
}

const zodEventsNearYouAddressField = object({
  address: zodGooglePlacesAutocompletePrediction,
})

type FormValues = z.infer<typeof zodEventsNearYouAddressField> & GenericErrorFormValues

export function EventsNearYou({ events }: EventsNearYouProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: userData } = useApiResponseForUserFullProfileInfo()
  const user = userData?.user
  const formattedAddress = user?.address?.formattedDescription
  const userState = user?.address?.administrativeAreaLevel1

  const form = useForm<FormValues>({
    resolver: zodResolver(zodEventsNearYouAddressField),
    mode: 'onChange',
  })

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsLoading(true)
      const address = values.address
        ? await convertGooglePlaceAutoPredictionToAddressSchema(values.address).catch(e => {
            Sentry.captureException(e)
            catchUnexpectedServerErrorAndTriggerToast(e)
            return null
          })
        : null
      const result = await triggerServerActionForForm(
        {
          form,
          formName: 'Events Page - Events Near You Form',
          analyticsProps: {
            ...(address ? convertAddressToAnalyticsProperties(address) : {}),
          },
          payload: {
            address,
            hasOptedInToSms: user?.hasOptedInToSms || false,
            hasOptedInToMembership: user?.hasOptedInToMembership || false,
            phoneNumber: user?.phoneNumber || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            isEmbeddedWalletUser: user?.hasEmbeddedWallet || false,
            emailAddress: user?.primaryUserEmailAddress?.emailAddress || '',
          },
        },
        payload => actionUpdateUserProfile(payload),
      )
      if (result.status === 'success') {
        router.refresh()
      }
      setIsLoading(false)
    },
    [form, router, user],
  )

  return (
    <section className="grid w-full items-center gap-4 lg:gap-6">
      <h4 className="text-bold text-center font-sans text-xl text-foreground">Events near you</h4>

      {isLoading ? (
        <div className="flex w-full flex-col items-center gap-4">
          <EventCardSkeleton />
        </div>
      ) : (
        <LoginDialogWrapper
          authenticatedContent={
            userState ? (
              <FilteredEventsNearUser
                events={events}
                formattedAddress={formattedAddress}
                userState={userState}
              />
            ) : (
              <Form {...form}>
                <div className="mx-auto w-full max-w-[562px]">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <GooglePlacesSelect
                            {...field}
                            className="bg-backgroundAlternate"
                            onChange={e => {
                              field.onChange(e)
                              void form.handleSubmit(onSubmit)()
                            }}
                            placeholder="Enter your address"
                            shouldLimitUSAddresses
                            value={field.value}
                          />
                        </FormControl>
                        <FormErrorMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            )
          }
          loadingFallback={
            <div className="flex w-full flex-col items-center gap-4">
              <EventCardSkeleton />
            </div>
          }
        >
          <div className="flex w-full max-w-[856px] flex-col gap-6 self-center rounded-2xl bg-backgroundAlternate px-[1.625rem] py-8 lg:mx-auto lg:flex-row lg:items-center lg:justify-between">
            <p className="text-center">Sign up or log in to see events near you</p>
            <Button className="w-full lg:w-auto">Sign up/in</Button>
          </div>
        </LoginDialogWrapper>
      )}
    </section>
  )
}

function FilteredEventsNearUser({
  events,
  userState,
  formattedAddress,
}: {
  events: SWCEvents
  userState: string
  formattedAddress?: string
}) {
  const filteredEventsNearUser = useMemo(() => {
    return userState
      ? events.filter(
          event =>
            event.data.state === userState && isAfter(new Date(event.data.datetime), new Date()),
        )
      : []
  }, [events, userState])

  const hasEvents = filteredEventsNearUser.length > 0

  if (!userState) return null

  return (
    <>
      {formattedAddress && hasEvents && (
        <p className="text-center">
          Showing events for <strong className="text-primary-cta">{formattedAddress}</strong>
        </p>
      )}

      <div className="flex w-full flex-col items-center gap-4">
        {hasEvents ? (
          filteredEventsNearUser.map(event => (
            <EventCard event={event.data} key={event.data.slug} />
          ))
        ) : (
          <p className="text-center font-mono text-sm text-muted-foreground">
            <Balancer>
              Unfortunately, there are no events happening near you at the moment. Please check back
              later for updates, as new events may be added soon.
            </Balancer>
          </p>
        )}
      </div>
    </>
  )
}
