'use client'

import { ReactNode, useState } from 'react'
import { GoogleMapsEmbed } from '@next/third-parties/google'
import { format } from 'date-fns'
import { Clock, Pin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { useDialog } from '@/hooks/useDialog'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY,
  'NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY',
)

interface EventDialogProps {
  event: SWCEvents[0]['data']
  trigger: ReactNode
}

export function EventDialog({ event, trigger }: EventDialogProps) {
  const [step, setStep] = useState<'event' | 'notificationActivated'>('event')
  const dialogProps = useDialog({ analytics: 'Event Dialog' })

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger className="flex w-full justify-center">{trigger}</DialogTrigger>
      <DialogContent
        a11yTitle={`State ${event.state} Events`}
        className="max-w-[578px]"
        onOpenAutoFocus={() => setStep('event')}
      >
        {step === 'event' ? (
          <EventInformationDialogContent
            event={event}
            onNotificationActivatedCallback={() => setStep('notificationActivated')}
          />
        ) : (
          <SuccessfulEventNotificationsSignupDialogContent />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EventInformationDialogContent({
  event,
  onNotificationActivatedCallback,
}: {
  event: SWCEvents[0]['data']
  onNotificationActivatedCallback: () => void
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
            onNotificationActivatedCallback()
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

function SuccessfulEventNotificationsSignupDialogContent() {
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
