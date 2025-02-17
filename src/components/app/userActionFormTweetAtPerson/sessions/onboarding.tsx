import Balancer from 'react-wrap-balancer'

import { TweetAtPersonSectionNames } from '@/components/app/userActionFormTweetAtPerson/constants'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { UseSectionsReturn } from '@/hooks/useSections'
import { VideoPlayer } from '@/components/ui/video'

export function OnboardingTweetAtPersonCampaign({
  goToSection,
}: UseSectionsReturn<TweetAtPersonSectionNames>) {
  return (
    <div className="flex flex-col items-center justify-center pb-8">
      <VideoPlayer
        type="video"
        url="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/swc_pizza_day_2024_nft.mp4"
        className="max-h-[266px] max-w-[454px] overflow-hidden rounded-lg"
        fit="cover"
        fallback={
          <NextImage
            alt="Pizza Day"
            height={266}
            priority
            src="/swc-pizza-day-2024-nft.webp"
            width={454}
          />
        }
        autoplay
        muted
        loop
      />

      <div className="mt-4 space-y-2">
        <PageTitle as="h3">Tweet your rep. Get a free NFT. 🍕</PageTitle>
        <p className="text-center text-fontcolor-muted">
          <Balancer>
            Held annually on May 22nd, Pizza Day commemorates the day when programmer Laszlo Hanyecz
            purchased two large pizzas for 10,000 BTC in 2010. The day stands as a symbol of
            bitcoin's humble beginnings, as well as a testament to its transformative potential as a
            viable medium of exchange.
          </Balancer>
        </p>

        <p className="mt-4 text-center text-fontcolor-muted">
          <Balancer>
            We’re honoring this day by fighting to keep crypto in America. Tweet your
            representatives and tell them crypto belongs in the U.S.
          </Balancer>
        </p>
      </div>

      <strong className="my-6">Here’s how to participate:</strong>

      <div className="align-center mb-16 flex flex-col justify-between gap-8 lg:mb-8 lg:flex-row lg:gap-14">
        <div className="flex flex-col items-center gap-4">
          <strong className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECEEF1]">
            1
          </strong>
          <p>Join Stand With Crypto</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <strong className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECEEF1]">
            2
          </strong>
          <p>Tweet your representative</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <strong className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECEEF1]">
            3
          </strong>
          <p>Claim your free NFT</p>
        </div>
      </div>

      <Button
        className="mt-auto w-full md:w-1/2"
        onClick={() => goToSection(TweetAtPersonSectionNames.TWEET)}
        size="lg"
      >
        Get started
      </Button>
    </div>
  )
}
