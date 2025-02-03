import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailDebateDeeplinkWrapper } from '@/components/app/userActionFormEmailDebate/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionEmailDebateDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.EMAIL,
            campaignName: UserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionEmailDebateDeepLink',
        }}
      >
        <UserActionFormEmailDebateDeeplinkWrapper />
      </ErrorBoundary>
    </HomepageDialogDeeplinkLayout>
  )
}
