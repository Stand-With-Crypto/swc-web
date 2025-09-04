import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'

interface SuccessfulEventNotificationsSignupProps {
  isCreatingRsvpEventAction: boolean
  handleRSVPButtonClick: () => void
}

export function SuccessfulEventNotificationsSignup({
  handleRSVPButtonClick,
  isCreatingRsvpEventAction,
}: SuccessfulEventNotificationsSignupProps) {
  return (
    <div className="flex flex-col items-center gap-2 pb-4 pt-8">
      <NextImage
        alt="SWC shield"
        className="mb-2 lg:mb-0"
        height={120}
        src="/shields/purple.svg"
        width={120}
      />

      <h3 className="mt-6 font-sans text-xl font-bold">You signed up for updates!</h3>
      <p className="text-center text-base text-muted-foreground">
        We’ll send you text updates on this event. RSVP to the event below.
      </p>

      <Button
        className="mt-4 w-full lg:w-auto"
        disabled={isCreatingRsvpEventAction}
        onClick={handleRSVPButtonClick}
      >
        RSVP
      </Button>
    </div>
  )
}
