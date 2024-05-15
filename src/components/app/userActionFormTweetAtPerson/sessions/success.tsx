'use client'

import { useRouter } from 'next/navigation'

import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Video } from '@/components/ui/video'
import { useLocale } from '@/hooks/useLocale'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'

export function TweetedAtPersonSuccessSection() {
  const router = useRouter()
  const locale = useLocale()

  return (
    <div className="flex h-full flex-col items-center justify-center pb-8">
      <Video
        className={'h-full max-h-[266px] w-full max-w-[454px] rounded-lg object-cover'}
        fallback={
          <NextImage
            alt="Pizza Day"
            height={266}
            priority
            src="/swc-pizza-day-2024-nft.webp"
            width={454}
          />
        }
        poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMMcJ/2HwAESgIuKCMGAAAAAABJRU5ErkJggg=="
        src="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/swc_pizza_day_2024_nft.mp4"
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
