import { UserActionType } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { CAMPAIGN_METADATA } from '@/components/app/userActionFormTweetAtPerson/constants'
import { UserActionFormTweetToPersonDeeplinkWrapper } from '@/components/app/userActionFormTweetAtPerson/homepageDialogDeeplinkWrapper.tsx'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { UserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = SECONDS_DURATION['30_SECONDS']
export const dynamic = 'error'
export const dynamicParams = true

const TWEET_AT_PERSON_CAMPAIGN_SLUGS = Object.values(UserActionTweetAtPersonCampaignName)

type Props = PageProps<{ slug: string }>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const content = CAMPAIGN_METADATA[slug as UserActionTweetAtPersonCampaignName]

  if (content) {
    return generateMetadataDetails({
      title: content.title,
    })
  }
  const title = `Tweet at your Congress Person`

  return generateMetadataDetails({
    title,
  })
}

export default async function UserActionTweetAtPersonDeepLink({ params }: Props) {
  const { slug } = params

  if (
    !slug ||
    (!TWEET_AT_PERSON_CAMPAIGN_SLUGS.includes(slug) &&
      slug !== UserActionTweetAtPersonCampaignName.DEFAULT)
  ) {
    notFound()
  }

  return (
    <ErrorBoundary
      extras={{
        action: {
          isDeeplink: true,
          actionType: UserActionType.TWEET_AT_PERSON,
          campaignName: slug,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionTweetAtPersonDeepLink',
      }}
    >
      <HomepageDialogDeeplinkLayout pageParams={params}>
        <div className={cn(dialogContentPaddingStyles, 'max-md:h-full')}>
          <UserActionFormTweetToPersonDeeplinkWrapper
            slug={slug as UserActionTweetAtPersonCampaignName}
          />
        </div>
      </HomepageDialogDeeplinkLayout>
    </ErrorBoundary>
  )
}
