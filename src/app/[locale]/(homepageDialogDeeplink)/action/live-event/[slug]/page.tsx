import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormLiveEventDeeplinkWrapper } from '@/components/app/userActionFormLiveEvent/homepageDialogDeeplinkWrapper.tsx'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'

export const revalidate = SECONDS_DURATION.SECOND * 30
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ slug: string }>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const title = `Live event ${slug}`

  return generateMetadataDetails({
    title,
  })
}

export default async function UserActionLiveEventDeepLink({ params }: Props) {
  const { slug } = params
  if (!slug || !(slug in UserActionLiveEventCampaignName)) {
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
