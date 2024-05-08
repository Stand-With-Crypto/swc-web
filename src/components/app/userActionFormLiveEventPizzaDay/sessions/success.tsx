'use client'

import { useRouter } from 'next/navigation'

import { PIZZA_DAY_LIVE_EVENT_SLUG_NFT_METADATA } from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLocale } from '@/hooks/useLocale'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

export function PizzaDaySuccessSection() {
  const router = useRouter()
  const locale = useLocale()
  const isMobile = useIsMobile()
  const nftImageMetadata =
    NFT_CLIENT_METADATA[PIZZA_DAY_LIVE_EVENT_SLUG_NFT_METADATA['2024_05_22_PIZZA_DAY']].image
  const nftImageOffset = !isMobile ? 200 : 0

  return (
    <div className="flex h-full flex-col items-center justify-center pb-8">
      <NextImage
        alt={nftImageMetadata.alt}
        className="rounded-lg"
        height={nftImageMetadata.height - nftImageOffset}
        src={nftImageMetadata.url}
        width={nftImageMetadata.width - nftImageOffset}
      />
      <PageTitle as="h3" className="mb-4 mt-6 lg:my-10" size="md">
        Nice work! Your NFT is on the way.
      </PageTitle>
      <p className="mb-8 text-center text-fontcolor-muted lg:mb-20">
        Your NFT will be available on your profile shortly. In the meantime, follow up your tweet
        with an email to your representative’s office.
      </p>

      <div className="mt-auto">
        <div className="mb-2 font-bold">Up next</div>

        <UserActionRowCTAButton
          {...USER_ACTION_ROW_CTA_INFO['EMAIL']}
          onClick={() =>
            router.replace(USER_ACTION_DEEPLINK_MAP['EMAIL'].getDeeplinkUrl({ locale }))
          }
          state="hidden"
        />
      </div>
    </div>
  )
}
