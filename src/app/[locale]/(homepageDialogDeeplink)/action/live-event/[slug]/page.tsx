import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { MESSAGES } from '@/components/app/userActionFormLiveEvent/constants'
import { UserActionFormLiveEventDeeplinkWrapper } from '@/components/app/userActionFormLiveEvent/homepageDialogDeeplinkWrapper.tsx'
import { UserActionFormPizzaDayLiveEventDeeplinkWrapper } from '@/components/app/userActionFormLiveEventPizzaDay/homepageDialogDeeplinkWrapper.tsx'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'
import { cn } from '@/utils/web/cn'

export const revalidate = SECONDS_DURATION.SECOND * 30
export const dynamic = 'error'
export const dynamicParams = true

const LIVE_EVENT_CAMPAIGN_SLUGS = Object.values(UserActionLiveEventCampaignName)

type Props = PageProps<{ slug: string }>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const content = MESSAGES[slug as UserActionLiveEventCampaignName]
  if (content) {
    return generateMetadataDetails({
      title: `Live Event - ${content.title}`,
    })
  }
  const title = `Live Event`

  return generateMetadataDetails({
    title,
  })
}

export default async function UserActionLiveEventDeepLink({ params }: Props) {
  const { slug } = params
  if (!slug || !LIVE_EVENT_CAMPAIGN_SLUGS.includes(slug)) {
    notFound()
  }

  if (slug === UserActionLiveEventCampaignName['2024_05_22_PIZZA_DAY']) {
    return (
      <HomepageDialogDeeplinkLayout pageParams={params}>
        <div className={cn(dialogContentPaddingStyles, 'max-md:h-full')}>
          <UserActionFormPizzaDayLiveEventDeeplinkWrapper />
        </div>
      </HomepageDialogDeeplinkLayout>
    )
  }

  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div className={dialogContentPaddingStyles}>
        <UserActionFormLiveEventDeeplinkWrapper slug={slug as UserActionLiveEventCampaignName} />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}
