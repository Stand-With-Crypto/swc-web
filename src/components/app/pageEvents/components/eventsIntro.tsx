import Balancer from 'react-wrap-balancer'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { NextImage } from '@/components/ui/image'

export function EventsIntro() {
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
            politics, and our culture – but we need to keep up the momentum. See below for a list of
            events happening nationwide, as well as information about how you can host your own SWC
            meet-up.
          </Balancer>
        </p>
      </div>

      <div className="mt-16 flex flex-col items-center gap-4">
        <NextImage
          alt="The America 💜 Crypto Tour 2024"
          blurDataURL={BannerBlurImageURL}
          className="hidden rounded-3xl lg:block"
          height={147}
          width={827}
          placeholder="blur"
          priority
          src="/misc/america-crypto-state-tour.jpg"
        />

        <PageSubTitle className="mt-6 text-center font-sans text-xl text-foreground">
          The America 💜 Crypto Tour 2024
        </PageSubTitle>
        <p className="text-center font-mono text-base text-muted-foreground">
          <Balancer>
            Join Stand With Crypto on the America 💜 Crypto Tour, an epic concert series across 5
            swing states, rallying 4 million crypto owners to make their voices heard. Featuring
            iconic acts and memorable venues. Stay tuned to see who’s coming to your state and when
            below.
          </Balancer>
        </p>
      </div>
    </section>
  )
}

const BannerBlurImageURL =
  'data:image/webp;base64,UklGRtADAABXRUJQVlA4WAoAAAAgAAAAygIAfgAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDgg4gEAABAjAJ0BKssCfwA+7XavVimnI6OgKgkwHYlpbuF3YMVFQHsAFDH+qes4eF/eB/TLdFfqnrOHhf3gf0y3RX6px6R1YF2lsLE+OmlWBdpbCxPjppVgXaWwsT46aVYF2lq5neB/TLtFySP1UFJ0rA2YNJ2zh4YNJ2zh4YNJ2zUYhVYaX8Ny2WEdPIUFJ8i6V0VaDuJT1SbcGuCmDSfn1YRzJluiv1T1nDwv7wP6y6P1T1nDwv7wQFySPxsH/0SIGC2JvnOIGDP52f9+JyJYDhIntl9J2f9+JyJRxq3EiBgtdCCfVxL6gG/6HqFrrIg2oWwemC11kQbULYm+ctQtdZBOEwSLyjnW+vL+8ox0v1T1nGds4eF/eCAuUjj2dMt0V+qevQAA/v+RN8LxFBUe3r552YAQAAAAAB3ua8b/ZiK7gy2Ijl4FbgZM0Mgno0RFdwZbERy8CtwMmaGQT0aIiu4MtiI5eBXKnHMBAHU3oonWWH3Zbu9BBOssPuy34OqtzeUIYBLEAAqPfxng/0cqsJm/F/sA1c+gJYgAH3RcdXuRfMrUI3L9TC5Hc9L6el+phcjuemFPexpLpkHz0jJCGKTv0bD6+EAbO3yqvtaaRdz6tJ4FdhlBWu1a5ybwM4kLIAQ8gAAA'
