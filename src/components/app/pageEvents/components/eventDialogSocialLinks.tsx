import { Facebook, Link, Mail, Twitter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'

export function EventDialogSocialLinks({
  eventState,
  eventSlug,
}: {
  eventState: string
  eventSlug: string
}) {
  const [_, handleCopyToClipboard] = useCopyTextToClipboard()
  const eventDeeplink = `https://standwithcrypto.org/events/${eventState.toLowerCase()}/${eventSlug}`

  return (
    <div className="mt-6 flex flex-col gap-2">
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
