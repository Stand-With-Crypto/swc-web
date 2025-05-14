import { UserActionType } from '@prisma/client'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { ErrorBoundary } from '@/utils/web/errorBoundary'
import { EMAIL_ACTION_DEEPLINK_SLUG_TO_CAMPAIGN_NAME } from '@/components/app/userActionFormEmailCongressperson/campaigns/deeplinkConfig'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'
export const dynamicParams = true

// export async function generateStaticParams() {
//   return Object.keys(EMAIL_ACTION_DEEPLINK_SLUG_TO_CAMPAIGN_NAME).map(slug => ({
//     campaignSlug: slug,
//   }))
// }

export default async function UserActionEmailCongresspersonDeepLink(
  props: PageProps<{ campaignSlug: string }>,
) {
  const params = await props.params
  const campaignSlug = params.campaignSlug
  const campaignName = EMAIL_ACTION_DEEPLINK_SLUG_TO_CAMPAIGN_NAME[campaignSlug]
  console.log('campaignName', campaignName)

  return (
    <USHomepageDialogDeeplinkLayout pageParams={params}>
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.EMAIL,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionEmailCongresspersonDeepLink',
        }}
      >
        <UserActionFormEmailCongresspersonDeeplinkWrapper campaignName={campaignName} />
      </ErrorBoundary>
    </USHomepageDialogDeeplinkLayout>
  )
}
