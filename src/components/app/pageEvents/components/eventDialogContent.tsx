'use client'

import { GoogleMapsEmbed } from '@next/third-parties/google'
import { format } from 'date-fns'
import { Clock, Pin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { useSections } from '@/hooks/useSections'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY,
  'NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY',
)

export enum SectionNames {
  EVENT_INFO = 'Event Information',
  NOTIFICATION_ACTIVATED = 'Event Notification Activated',
}

interface EventDialogContentProps {
  event: SWCEvents[0]['data']
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
  event: SWCEvents[0]['data']
  onNotificationActivation: () => void
}) {
  const formattedEventDate = format(new Date(event.datetime), 'EEEE M/d h:mm a')

  return (
    <div className="flex h-full flex-col items-center gap-2">
      <NextImage
        alt={`${event.state} shield`}
        className="mb-2 lg:mb-0"
        height={100}
        src={`/stateShields/${event.state}.png`}
        width={100}
      />
      <h3 className="font-sans text-xl font-bold">{event.name}</h3>
      <p className="text-center font-mono text-base text-muted-foreground">{event.description}</p>
      <p className="mt-9 flex items-center gap-2 font-mono text-sm">
        <Clock size={16} /> {formattedEventDate}
      </p>
      <p className="mb-9 mt-5 flex items-center gap-2 font-mono text-sm">
        <Pin size={16} /> {event.formattedAddress}
      </p>

      <GoogleMapsEmbed
        apiKey={NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY}
        height={420}
        mode="place"
        q={event.formattedAddress.replace(' ', '+')}
        width={466}
      />

      <div className="mt-auto flex w-full flex-col-reverse items-center justify-end gap-3 lg:mt-0 lg:flex-row">
        <Button
          className="w-full lg:w-auto"
          onClick={() => {
            // TODO: Implement notification logic
            onNotificationActivation()
          }}
          variant="secondary"
        >
          Get updates
        </Button>
        <Button asChild className="w-full lg:w-auto">
          <a href={event.rsvpUrl} target="_blank">
            RSVP
          </a>
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
