import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { MESSAGES } from '@/components/app/userActionFormLiveEvent/constants'
import { UserActionFormLiveEventDeeplinkWrapper } from '@/components/app/userActionFormLiveEvent/homepageDialogDeeplinkWrapper.tsx'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

const LIVE_EVENT_CAMPAIGN_SLUGS = Object.values(UserActionLiveEventCampaignName)

type Props = PageProps<{ slug: string }>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
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

export default async function UserActionLiveEventDeepLink(props: Props) {
  const params = await props.params
  const { slug } = params
  if (!slug || !LIVE_EVENT_CAMPAIGN_SLUGS.includes(slug)) {
    notFound()
  }

  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div className={dialogContentPaddingStyles}>
        <UserActionFormLiveEventDeeplinkWrapper slug={slug as UserActionLiveEventCampaignName} />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}
