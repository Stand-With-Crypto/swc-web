import Balancer from 'react-wrap-balancer'

import {
  PIZZA_DAY_LIVE_EVENT_SLUG_NFT_METADATA,
  TweetAtPersonSectionNames,
} from '@/components/app/userActionFormTweetAtPerson/constants'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useIsMobile } from '@/hooks/useIsMobile'
import { UseSectionsReturn } from '@/hooks/useSections'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

export function OnboardingTweetAtPersonCampaign({
  goToSection,
}: UseSectionsReturn<TweetAtPersonSectionNames>) {
  const isMobile = useIsMobile()
  const nftImageMetadata =
    NFT_CLIENT_METADATA[PIZZA_DAY_LIVE_EVENT_SLUG_NFT_METADATA['2024_05_22_PIZZA_DAY']].image
  const nftImageOffset = !isMobile ? 200 : 0

  return (
    <div className="flex flex-col items-center justify-center pb-8">
      <NextImage
        alt={nftImageMetadata.alt}
        className="rounded-lg"
        height={nftImageMetadata.height - nftImageOffset}
        src={nftImageMetadata.url}
        width={nftImageMetadata.width - nftImageOffset}
      />
      <PageTitle as="h3" className="mb-4 mt-6 lg:my-10" size="md">
        Tweet your rep. Get a free NFT. 🍕
      </PageTitle>
      <p className="text-center text-fontcolor-muted">
        <Balancer>
          Held annually on May 22nd, Pizza Day commemorates the day when programmer Laszlo Hanyecz
          purchased two large pizzas for 10,000 BTC in 2010. The day stands as a symbol of bitcoin's
          humble beginnings, as well as a testament to its transformative potential as a viable
          medium of exchange.
        </Balancer>
      </p>

      <p className="mt-6 text-center text-fontcolor-muted">
        <Balancer>
          We’re honoring this day by fighting to keep crypto in America. Tweet your representatives
          and tell them crypto belongs in the U.S.
        </Balancer>
      </p>

      <strong className="my-8">Here’s how to participate:</strong>

      <div className="align-center mb-16 flex flex-col justify-between gap-8 lg:mb-10 lg:flex-row lg:gap-14">
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
