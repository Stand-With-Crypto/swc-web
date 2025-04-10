import { UserActionType } from '@prisma/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { CAMPAIGN_METADATA } from '@/components/app/userActionFormTweetAtPerson/constants'
import { UserActionFormTweetToPersonDeeplinkWrapper } from '@/components/app/userActionFormTweetAtPerson/homepageDialogDeeplinkWrapper.tsx'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { USUserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'
export const dynamicParams = true

const TWEET_AT_PERSON_CAMPAIGN_SLUGS = Object.values(USUserActionTweetAtPersonCampaignName)

type Props = PageProps<{ slug: string }>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { slug } = params
  const content = CAMPAIGN_METADATA[slug as USUserActionTweetAtPersonCampaignName]

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

export default async function UserActionTweetAtPersonDeepLink(props: Props) {
  const params = await props.params
  const { slug } = params

  if (
    !slug ||
    (!TWEET_AT_PERSON_CAMPAIGN_SLUGS.includes(slug) &&
      slug !== USUserActionTweetAtPersonCampaignName.DEFAULT)
  ) {
    notFound()
  }

  return (
    <USHomepageDialogDeeplinkLayout pageParams={params}>
      <div className={cn(dialogContentPaddingStyles, 'max-md:h-full')}>
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
          <UserActionFormTweetToPersonDeeplinkWrapper
            slug={slug as USUserActionTweetAtPersonCampaignName}
          />
        </ErrorBoundary>
      </div>
    </USHomepageDialogDeeplinkLayout>
  )
}
