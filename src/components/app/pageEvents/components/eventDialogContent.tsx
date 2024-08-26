'use client'

import Balancer from 'react-wrap-balancer'
import { UserActionType } from '@prisma/client'
import { format, isBefore, startOfDay } from 'date-fns'
import { Clock, Pin } from 'lucide-react'
import sanitizeHtml from 'sanitize-html'
import { toast } from 'sonner'

import {
  actionCreateUserActionRsvpEvent,
  CreateActionRsvpEventInput,
} from '@/actions/actionCreateUserActionRsvpEvent'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { EventDialogPhoneNumber } from '@/components/app/pageEvents/components/eventDialogPhoneNumber'
import { EventDialogSocialLinks } from '@/components/app/pageEvents/components/eventDialogSocialLinks'
import { GoogleMapsEmbedIFrame } from '@/components/app/pageEvents/components/eventGoogleMapsEmbedIframe'
import { SuccessfulEventNotificationsSignup } from '@/components/app/pageEvents/components/successfulEventSignupDialog'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useSections } from '@/hooks/useSections'
import { SWCEvent } from '@/utils/shared/getSWCEvents'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

enum SectionNames {
  EVENT_INFO = 'Event Information',
  PHONE_SECTION = 'Phone Section',
  NOTIFICATION_ACTIVATED = 'Event Notification Activated',
}

interface EventDialogContentProps {
  event: SWCEvent
}

export function EventDialogContent({ event }: EventDialogContentProps) {
  usePreventOverscroll()
  const { data: userFullProfileInfoResponse } = useApiResponseForUserFullProfileInfo()
  const { user } = userFullProfileInfoResponse ?? { user: null }
  const hasPhoneInformation = !!user?.phoneNumber

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.EVENT_INFO,
    analyticsName: 'Event Details Dialog',
  })

  const _handleCreateRsvpAction = async ({
    shouldReceiveNotifications,
  }: {
    shouldReceiveNotifications: boolean
  }) => {
    const data: CreateActionRsvpEventInput = {
      eventSlug: event.slug,
      eventState: event.state,
      shouldReceiveNotifications,
    }

    const result = await triggerServerActionForForm(
      {
        formName: 'RSVP Event',
        onError: () => toastGenericError(),
        analyticsProps: {
          'Campaign Name': USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.RSVP_EVENT,
          'User Action Type': UserActionType.RSVP_EVENT,
          eventSlug: event.slug,
          eventState: event.state,
          shouldReceiveNotifications,
        },
        payload: data,
      },
      payload =>
        actionCreateUserActionRsvpEvent(payload).then(actionResult => {
          if (actionResult?.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )

    if (result.status !== 'success') {
      toastGenericError()
    }
  }

  const [handleCreateRsvpAction, isCreatingRsvpEventAction] =
    useLoadingCallback(_handleCreateRsvpAction)

  const handleGetUpdates = async () => {
    await handleCreateRsvpAction({
      shouldReceiveNotifications: true,
    })

    toast.success('Thank you for your interest! We will send you a reminder closer to the event.')
    sectionProps.goToSection(SectionNames.NOTIFICATION_ACTIVATED)
  }

  const handleRSVPButtonClick = () => {
    void handleCreateRsvpAction({
      shouldReceiveNotifications: false,
    })

    window.open(event.rsvpUrl, '_blank')
  }

  if (sectionProps.currentSection === SectionNames.NOTIFICATION_ACTIVATED) {
    return (
      <SuccessfulEventNotificationsSignup
        handleRSVPButtonClick={handleRSVPButtonClick}
        isCreatingRsvpEventAction={isCreatingRsvpEventAction}
      />
    )
  }

  if (sectionProps.currentSection === SectionNames.PHONE_SECTION) {
    return <EventDialogPhoneNumber onSuccess={handleGetUpdates} />
  }

  return (
    <EventInformation
      event={event}
      handleGetUpdatesButtonClick={async () => {
        if (!hasPhoneInformation) return sectionProps.goToSection(SectionNames.PHONE_SECTION)

        await handleGetUpdates()
      }}
      handleRSVPButtonClick={handleRSVPButtonClick}
      isCreatingRsvpEventAction={isCreatingRsvpEventAction}
    />
  )
}

function EventInformation({
  event,
  isCreatingRsvpEventAction,
  handleGetUpdatesButtonClick,
  handleRSVPButtonClick,
}: {
  event: SWCEvent
  isCreatingRsvpEventAction: boolean
  handleGetUpdatesButtonClick: () => Promise<void>
  handleRSVPButtonClick: () => void
}) {
  const eventDate = event?.time
    ? new Date(`${event.date}T${event.time}`)
    : new Date(`${event.date}T00:00`)
  const formattedEventDate = format(eventDate, event?.time ? 'EEEE M/d, h:mm a' : 'EEEE M/d')
  const isPastEvent = isBefore(startOfDay(eventDate), startOfDay(new Date()))

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="overflow-auto px-4 py-6 md:max-h-[70vh]">
        <div className="flex h-full flex-col items-center gap-2">
          <NextImage
            alt={`${event.state} shield`}
            className="mb-2 lg:mb-0"
            height={100}
            src={`/stateShields/${event.state}.png`}
            width={100}
          />
          <h3 className="text-center font-sans text-xl font-bold">
            <Balancer>{event.name}</Balancer>
          </h3>
          <div className="text-center font-mono text-base text-muted-foreground">
            <Balancer
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.formattedDescription) }}
            />
          </div>
          <p className="mt-9 flex items-center gap-2 font-mono text-sm">
            <Clock size={16} /> {formattedEventDate}
          </p>
          <p className="mb-9 mt-5 flex items-center gap-2 font-mono text-sm">
            <Pin size={16} /> {event.formattedAddress}
          </p>

          <GoogleMapsEmbedIFrame address={event.formattedAddress} />

          <EventDialogSocialLinks eventSlug={event.slug} eventState={event.state} />
        </div>
      </ScrollArea>

      {!isPastEvent && (
        <div
          className="z-10 mt-auto flex flex-col items-center justify-end gap-3 border border-t px-4 py-6 lg:flex-row"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
        >
          <LoginDialogWrapper
            authenticatedContent={
              <Button
                className="w-full lg:w-auto"
                disabled={isCreatingRsvpEventAction}
                onClick={handleGetUpdatesButtonClick}
                variant="secondary"
              >
                Get updates
              </Button>
            }
          >
            <Button className="w-full md:w-1/2" variant="secondary">
              Log in to get updates
            </Button>
          </LoginDialogWrapper>

          <Button
            className="w-full lg:w-auto"
            disabled={isCreatingRsvpEventAction}
            onClick={handleRSVPButtonClick}
          >
            RSVP
          </Button>
        </div>
      )}
    </div>
  )
}
