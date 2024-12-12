import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionVotingDayDeeplinkWrapper } from '@/components/app/userActionVotingDay/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionVotingDayDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <ErrorBoundary
      extras={{
        action: {
          isDeeplink: true,
          actionType: UserActionType.VOTING_DAY,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionVotingDayDeepLink',
      }}
    >
      <HomepageDialogDeeplinkLayout pageParams={params}>
        <div className={cn(dialogContentPaddingStyles, 'h-full')}>
          <UserActionVotingDayDeeplinkWrapper />
        </div>
      </HomepageDialogDeeplinkLayout>
    </ErrorBoundary>
  )
}
