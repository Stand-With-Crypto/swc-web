import { LIVE_EVENT_SLUG_NFT_METADATA } from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useIsMobile } from '@/hooks/useIsMobile'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

export function OnboardingPizzaDayLiveEvent() {
  const isMobile = useIsMobile()
  const nftImageMetadata =
    NFT_CLIENT_METADATA[LIVE_EVENT_SLUG_NFT_METADATA['2024_05_22_PIZZA_DAY']].image
  const nftImageOffset = !isMobile ? 200 : 0

  return (
    <div className="flex flex-col items-center justify-center">
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
        Held annually on May 22nd, Pizza Day commemorates the day when programmer Laszlo Hanyecz
        purchased two large pizzas for 10,000 BTC in 2010. The day stands as a symbol of bitcoin's
        humble beginnings, as well as a testament to its transformative potential as a viable medium
        of exchange.
      </p>

      <p className="mt-6 text-center text-fontcolor-muted">
        We’re honoring this day by fighting to keep crypto in America. Tweet your representatives
        and tell them crypto belongs in the U.S.
      </p>

      <strong className="my-8">Here’s how to participate:</strong>

      <div className="align-center flex justify-between gap-14">
        <div className="mb-8 flex flex-col items-center gap-4">
          <strong className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECEEF1]">
            1
          </strong>
          <p>Join Stand With Crypto</p>
        </div>

        <div className="mb-8 flex flex-col items-center gap-4">
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

      <div className="mt-2">
        <Button size="lg">Get started</Button>
      </div>
    </div>
  )
}
