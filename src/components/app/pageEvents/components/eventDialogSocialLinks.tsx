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

        <Button asChild className="inline-block lg:hidden" variant="link">
          <a
            href={`mailto:?subject=Event from Stand with Crypto&body=I found an event I’m interested in from Stand with Crypto and wanted to share it with you.  Stand With Crypto is a pro-crypto organization dedicated to activating and mobilizing the crypto community. Find more information about the event here: ${eventDeeplink}`}
          >
            <Mail size={20} />
          </a>
        </Button>

        <Button asChild variant="link">
          <a
            href={`http://twitter.com/share?&hashtags=#StandWithCrypto&text=I’m interested in an event from @StandWithCrypto! It’s time to make our voices heard and protect the future of crypto in America. Learn more about the event here: ${eventDeeplink}`}
            target="_blank"
          >
            <Twitter size={20} />
          </a>
        </Button>

        <Button asChild variant="link">
          <a href={`https://www.facebook.com/sharer.php?u=${eventDeeplink}`} target="_blank">
            <Facebook size={20} />
          </a>
        </Button>
      </div>
    </div>
  )
}
