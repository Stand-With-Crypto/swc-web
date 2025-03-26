'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Balancer from 'react-wrap-balancer'
import { SMSStatus } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { EventCard } from '@/components/app/pageEvents/components/eventCard'
import { SMSOptInForm } from '@/components/app/smsOptInForm'
import { Button } from '@/components/ui/button'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getGBCountryCodeFromName } from '@/utils/shared/gbCountryUtils'

interface EventsNearYouProps {
  events: SWCEvents
}

export function EventsNearYou(props: EventsNearYouProps) {
  return (
    <Suspense fallback={null}>
      <SuspenseEventsNearYou {...props} />
    </Suspense>
  )
}

function SuspenseEventsNearYou({ events }: EventsNearYouProps) {
  const { setAddress, address } = useMutableCurrentUserAddress()
  const [userState, setUserState] = useState<string>()

  const onChangeAddress = useCallback(
    async (prediction: GooglePlaceAutocompletePrediction | null) => {
      if (!prediction) {
        setAddress(null)
        return
      }

      const details = await convertGooglePlaceAutoPredictionToAddressSchema(prediction)

      if (details.countryCode.toLowerCase() === SupportedCountryCodes.GB) {
        return setUserState(getGBCountryCodeFromName(details.administrativeAreaLevel1))
      }

      setUserState(details.administrativeAreaLevel1)
    },
    [],
  )

  useEffect(() => {
    if (address === 'loading') return

    void onChangeAddress(address)
  }, [address, onChangeAddress])

  return (
    <section className="grid w-full items-center gap-4 lg:gap-6">
      <PageTitle as="h3">Events near you</PageTitle>

      <div className="mx-auto w-full max-w-[562px]">
        <GooglePlacesSelect
          className="bg-backgroundAlternate"
          loading={address === 'loading'}
          onChange={setAddress}
          placeholder="Enter your address"
          value={address !== 'loading' ? address : null}
        />
      </div>

      {address ? <FilteredEventsNearUser events={events} userState={userState} /> : null}
    </section>
  )
}

function FilteredEventsNearUser({
  events,
  userState,
}: {
  events: SWCEvents
  userState: string | undefined
}) {
  const filteredEventsNearUser = useMemo(() => {
    return events.filter(event => event.data.state === userState)
  }, [events, userState])

  const hasEvents = filteredEventsNearUser.length > 0

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {hasEvents ? (
        filteredEventsNearUser.map(event => (
          <EventCard event={event.data} key={getUniqueEventKey(event.data)} />
        ))
      ) : (
        <NoEventsNearYou />
      )}
    </div>
  )
}

function NoEventsNearYou() {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const user = profileReq.data?.user

  if (profileReq.isLoading) {
    return null
  }

  return (
    <div className="container flex flex-col items-center gap-4">
      <p className="text-center font-mono text-sm text-muted-foreground">
        <Balancer>
          There are no events happening near you at the moment.{' '}
          {user ? (
            <CTATextBySMSStatus smsStatus={user.smsStatus} />
          ) : (
            'Join Stand With Crypto and we’ll keep you updated on any events in your area.'
          )}
        </Balancer>
      </p>
      {user ? (
        <>
          {user.smsStatus === SMSStatus.NOT_OPTED_IN && (
            <SMSOptInForm
              initialValues={{
                phoneNumber: user?.phoneNumber ?? '',
              }}
              onSuccess={({ phoneNumber }) =>
                void profileReq.mutate({
                  user: {
                    ...profileReq.data!.user!,
                    phoneNumber,
                  },
                })
              }
            >
              {({ form }) => (
                <div className="mt-4">
                  <div className="flex flex-col items-center gap-4">
                    <SMSOptInForm.PhoneNumberField className="w-full max-w-[400px]" />
                    <SMSOptInForm.SubmitButton
                      disabled={form.formState.isSubmitting}
                      variant="secondary"
                    >
                      Get updates
                    </SMSOptInForm.SubmitButton>
                    <SMSOptInForm.Footnote className="mt-4 w-full max-w-xl text-center text-xs" />
                  </div>
                </div>
              )}
            </SMSOptInForm>
          )}
        </>
      ) : (
        <LoginDialogWrapper>
          <Button variant="secondary">Sign in</Button>
        </LoginDialogWrapper>
      )}
    </div>
  )
}

function CTATextBySMSStatus({ smsStatus }: { smsStatus: SMSStatus }) {
  if (smsStatus === SMSStatus.NOT_OPTED_IN) {
    return `Enter your number and we’ll keep you updated on any events in your area.`
  }

  if (
    [
      SMSStatus.OPTED_IN,
      SMSStatus.OPTED_IN_HAS_REPLIED,
      SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN,
    ].includes(smsStatus)
  ) {
    return `We’ll keep you updated on any events in your area.`
  }

  return 'Please check back later for updates, as new events may be added soon.'
}
