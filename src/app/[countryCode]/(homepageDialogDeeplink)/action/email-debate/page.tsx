import { UserActionType } from '@prisma/client'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { UserActionFormEmailDebateDeeplinkWrapper } from '@/components/app/userActionFormEmailDebate/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionEmailDebateDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <USHomepageDialogDeeplinkLayout pageParams={params}>
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.EMAIL,
            campaignName: USUserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionEmailDebateDeepLink',
        }}
      >
        <UserActionFormEmailDebateDeeplinkWrapper />
      </ErrorBoundary>
    </USHomepageDialogDeeplinkLayout>
  )
}
