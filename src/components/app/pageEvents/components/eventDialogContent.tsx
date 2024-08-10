'use client'

import { memo, useState } from 'react'
import Balancer from 'react-wrap-balancer'
import { GoogleMapsEmbed } from '@next/third-parties/google'
import { UserActionType } from '@prisma/client'
import { format } from 'date-fns'
import { Clock, Facebook, Link, Mail, Pin, Twitter } from 'lucide-react'
import { toast } from 'sonner'

import {
  actionCreateUserActionRsvpEvent,
  CreateActionRsvpEventInput,
} from '@/actions/actionCreateUserActionRsvpEvent'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useSections } from '@/hooks/useSections'
import { SWCEvent } from '@/utils/shared/getSWCEvents'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

const NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY,
  'NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY',
)

export enum SectionNames {
  EVENT_INFO = 'Event Information',
  NOTIFICATION_ACTIVATED = 'Event Notification Activated',
}

interface EventDialogContentProps {
  event: SWCEvent
}

export function EventDialogContent({ event }: EventDialogContentProps) {
  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.EVENT_INFO,
    analyticsName: 'Event Details Dialog',
  })

  if (sectionProps.currentSection === SectionNames.NOTIFICATION_ACTIVATED) {
    return <SuccessfulEventNotificationsSignup />
  }
  return (
    <EventInformation
      event={event}
      onNotificationActivation={() => sectionProps.goToSection(SectionNames.NOTIFICATION_ACTIVATED)}
    />
  )
}

function EventInformation({
  event,
  onNotificationActivation,
}: {
  event: SWCEvent
  onNotificationActivation: () => void
}) {
  const [isCreatingRsvpEventAction, setIsCreatingRsvpEventAction] = useState(false)
  const formattedEventDate = format(new Date(event.datetime), 'EEEE M/d h:mm a')

  async function handleCreateRsvpAction({
    shouldReceiveNotifications,
    onSuccessCallback,
  }: {
    shouldReceiveNotifications: boolean
    onSuccessCallback: () => void
  }) {
    setIsCreatingRsvpEventAction(true)

    const data: CreateActionRsvpEventInput = {
      eventSlug: event.slug,
      eventState: event.state,
      shouldReceiveNotifications,
    }

    const result = await triggerServerActionForForm(
      {
        formName: 'RSVP Event',
        onError: (_, error) => {
          toast.error(error.message, {
            duration: 5000,
          })
        },
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

    if (result.status === 'success') {
      onSuccessCallback()
    } else {
      toastGenericError()
    }
    setIsCreatingRsvpEventAction(false)
  }

  async function handleGetUpdatesButtonClick() {
    await handleCreateRsvpAction({
      shouldReceiveNotifications: true,
      onSuccessCallback: onNotificationActivation,
    })

    toast.success('Thank you for your interest! We will send you a reminder closer to the event.')
  }

  async function handleRSVPButtonClick() {
    await handleCreateRsvpAction({
      shouldReceiveNotifications: false,
      onSuccessCallback: () => {
        window.open(event.rsvpUrl, '_blank')
      },
    })
  }

  return (
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
      <p className="text-center font-mono text-base text-muted-foreground">
        <Balancer>{event.description}</Balancer>
      </p>
      <p className="mt-9 flex items-center gap-2 font-mono text-sm">
        <Clock size={16} /> {formattedEventDate}
      </p>
      <p className="mb-9 mt-5 flex items-center gap-2 font-mono text-sm">
        <Pin size={16} /> {event.formattedAddress}
      </p>

      <GoogleMapsEmbedIFrame address={event.formattedAddress} />

      <SocialLinks eventSlug={event.slug} eventState={event.state} />

      <div className="mt-8 flex w-full flex-col items-center justify-end gap-3 lg:flex-row">
        <Button
          className="w-full lg:w-auto"
          disabled={isCreatingRsvpEventAction}
          onClick={handleGetUpdatesButtonClick}
          variant="secondary"
        >
          Get updates
        </Button>
        <Button
          className="w-full lg:w-auto"
          disabled={isCreatingRsvpEventAction}
          onClick={handleRSVPButtonClick}
        >
          RSVP
        </Button>
      </div>
    </div>
  )
}

function SuccessfulEventNotificationsSignup() {
  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      <NextImage
        alt="SWC shield"
        className="mb-2 lg:mb-0"
        height={120}
        src="/shields/purple.svg"
        width={120}
      />

      <h3 className="mt-6 font-sans text-xl font-bold">You signed up for updates!</h3>
      <p className="text-center font-mono text-base text-muted-foreground">
        We’ll send you text updates on this event and other similar events in your area.
      </p>
    </div>
  )
}

function SocialLinks({ eventState, eventSlug }: { eventState: string; eventSlug: string }) {
  const [_, handleCopyToClipboard] = useCopyTextToClipboard()
  const eventDeeplink = `https://standwithcrypto.org/events/${eventState.toLowerCase()}/${eventSlug}`

  return (
    <div className="mt-8 flex flex-col gap-6">
      <h5 className="text-center font-mono text-base font-bold">Share</h5>

      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={() => {
            handleCopyToClipboard(eventDeeplink)
          }}
          variant="link"
        >
          <Link size={20} />
        </Button>

        <Button asChild variant="link">
          {/* // TODO: Get the right copy */}
          <a
            href={`mailto:?subject=Stand With Crypto Event&body=Check out this event: ${eventDeeplink}`}
          >
            <Mail size={20} />
          </a>
        </Button>

        <Button asChild variant="link">
          {/* // TODO: Get the right copy */}
          <a
            href={`http://twitter.com/share?url=${eventDeeplink}&hashtags=StandWithCrypto,Event&text=Check out this event`}
            target="_blank"
          >
            <Twitter size={20} />
          </a>
        </Button>

        <Button asChild variant="link">
          {/* // TODO: Get the right copy */}
          <a href={`https://www.facebook.com/sharer.php?u=${eventDeeplink}`} target="_blank">
            <Facebook size={20} />
          </a>
        </Button>
      </div>
    </div>
  )
}

// This component is memoized because it was blinking on rerender.
const GoogleMapsEmbedIFrame = memo(({ address }: { address: string }) => {
  const isMobile = useIsMobile()
  const width = isMobile ? window.innerWidth - 48 : 466

  return (
    <div className="flex items-center justify-center">
      <GoogleMapsEmbed
        apiKey={NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY}
        height={420}
        mode="place"
        q={address.replace(' ', '+')}
        width={width}
      />
    </div>
  )
})

GoogleMapsEmbedIFrame.displayName = 'GoogleMapsEmbedIFrame'
