'use client'

import Balancer from 'react-wrap-balancer'

import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useIsMobile } from '@/hooks/useIsMobile'

export function EventsIntro() {
  const isMobile = useIsMobile()

  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col gap-4 lg:gap-6">
        <PageTitle className="text-center font-sans text-xl text-foreground lg:text-4xl">
          Events
        </PageTitle>
        <p className="text-center font-mono text-base text-muted-foreground lg:text-xl">
          <Balancer>
            Stand With Crypto Alliance is dedicated to engaging and empowering the crypto community
            both online and at real-world events. Crypto is a major force in our economy, our
            politics, and our culture – but we need to keep up the momentum.
          </Balancer>
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 lg:mt-16">
        {isMobile ? (
          <div className="relative h-60 w-full">
            <NextImage
              alt="Events"
              blurDataURL={mobileBannerBlurImageURL}
              className="rounded-3xl object-cover object-center"
              fill
              placeholder="blur"
              priority
              sizes="(max-width: 640px) 100vw, 271px"
              src="/homepageEventsHero.jpg"
            />
          </div>
        ) : (
          <div className="relative h-48 w-full">
            <NextImage
              alt="The America Loves Crypto Tour 2024"
              blurDataURL={desktopBannerBlurImageURL}
              className="rounded-3xl object-cover object-center"
              fill
              placeholder="blur"
              priority
              src="/misc/america-crypto-state-tour.jpg"
            />
          </div>
        )}

        <PageSubTitle className="mt-6 text-center font-sans text-xl text-foreground">
          The America 💜 Crypto Tour 2024
        </PageSubTitle>
        <p className="text-center font-mono text-base text-muted-foreground">
          <Balancer>
            Join Stand With Crypto on the America Loves Crypto Tour, an epic concert series across 5
            swing states, rallying 4 million crypto owners to make their voices heard. Featuring
            iconic acts and memorable venues. Stay tuned to see who’s coming to your state and when
            below.
          </Balancer>
        </p>
      </div>
    </section>
  )
}

const desktopBannerBlurImageURL =
  'data:image/webp;base64,UklGRtADAABXRUJQVlA4WAoAAAAgAAAAygIAfgAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDgg4gEAABAjAJ0BKssCfwA+7XavVimnI6OgKgkwHYlpbuF3YMVFQHsAFDH+qes4eF/eB/TLdFfqnrOHhf3gf0y3RX6px6R1YF2lsLE+OmlWBdpbCxPjppVgXaWwsT46aVYF2lq5neB/TLtFySP1UFJ0rA2YNJ2zh4YNJ2zh4YNJ2zUYhVYaX8Ny2WEdPIUFJ8i6V0VaDuJT1SbcGuCmDSfn1YRzJluiv1T1nDwv7wP6y6P1T1nDwv7wQFySPxsH/0SIGC2JvnOIGDP52f9+JyJYDhIntl9J2f9+JyJRxq3EiBgtdCCfVxL6gG/6HqFrrIg2oWwemC11kQbULYm+ctQtdZBOEwSLyjnW+vL+8ox0v1T1nGds4eF/eCAuUjj2dMt0V+qevQAA/v+RN8LxFBUe3r552YAQAAAAAB3ua8b/ZiK7gy2Ijl4FbgZM0Mgno0RFdwZbERy8CtwMmaGQT0aIiu4MtiI5eBXKnHMBAHU3oonWWH3Zbu9BBOssPuy34OqtzeUIYBLEAAqPfxng/0cqsJm/F/sA1c+gJYgAH3RcdXuRfMrUI3L9TC5Hc9L6el+phcjuemFPexpLpkHz0jJCGKTv0bD6+EAbO3yqvtaaRdz6tJ4FdhlBWu1a5ybwM4kLIAQ8gAAA'

const mobileBannerBlurImageURL =
  'data:image/webp;base64,UklGRv4CAABXRUJQVlA4WAoAAAAgAAAAjgAAbwAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggEAEAAPAJAJ0BKo8AcAA+7XCwVDo4LyMjltprQB2JZ27f/0vtHUAEv7YI8mOIVlNInsDIeCSzQkLgm/u1IsG9YlNTZtqXtebba/7rL6ep5K0fAiYyyIU6cUl6CsAA/u3Xo7/natj7NMphIg+7yS8SXSvXfnWbevcQhr3EYBT6dDQQbFhU9U1mMS8vTvp4u4xMjLeEKSnmYWaRI6ErbfhuLSyskgFwds+xoVeF8MoweVqnXSFlB1o81gL2Vw5LQRr1dym8owm0Noe7tvNWrjUjM0SdhtT2oWixgk2M3SMcDrADafLQsy5xOWP2QX0Mh/E0ZoLjatQCB61h9V2pPDghwsCO8xSFgZupmki6tngCZwodAAAA'
