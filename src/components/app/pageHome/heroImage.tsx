import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export function HeroImage({ locale }: { locale: SupportedLocale }) {
  return (
    <div className="relative h-[320px] overflow-hidden md:rounded-xl lg:h-[400px]">
      <InternalLink href={getIntlUrls(locale).events()}>
        <NextImage
          alt="Events"
          blurDataURL={eventImageBlurDataUrl}
          className="absolute left-0 top-0 h-full w-full object-cover"
          fill
          placeholder="blur"
          priority
          sizes={'(max-width: 400px) 375px, 500px'}
          src="/homepageEventsHero.jpg"
        />
      </InternalLink>

      <div
        className={cn(
          'absolute bottom-0 flex w-full items-center justify-between gap-4 p-4 text-sm text-white',
        )}
        style={{
          background:
            'linear-gradient(to top, hsla(0, 0%, 0%, 0.8) 10%, hsla(0, 0%, 0%, 0.4) 70%,  transparent 100%)',
        }}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <p>RSVP to reserve a spot in your state</p>
          <Button asChild variant="secondary">
            <Link href={getIntlUrls(locale).events()}>
              RSVP <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

const eventImageBlurDataUrl =
  'data:image/webp;base64,UklGRv4CAABXRUJQVlA4WAoAAAAgAAAAjgAAbwAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggEAEAAPAJAJ0BKo8AcAA+7XCwVDo4LyMjltprQB2JZ27f/0vtHUAEv7YI8mOIVlNInsDIeCSzQkLgm/u1IsG9YlNTZtqXtebba/7rL6ep5K0fAiYyyIU6cUl6CsAA/u3Xo7/natj7NMphIg+7yS8SXSvXfnWbevcQhr3EYBT6dDQQbFhU9U1mMS8vTvp4u4xMjLeEKSnmYWaRI6ErbfhuLSyskgFwds+xoVeF8MoweVqnXSFlB1o81gL2Vw5LQRr1dym8owm0Noe7tvNWrjUjM0SdhtT2oWixgk2M3SMcDrADafLQsy5xOWP2QX0Mh/E0ZoLjatQCB61h9V2pPDghwsCO8xSFgZupmki6tngCZwodAAAA'
