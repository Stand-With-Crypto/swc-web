import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionVotingDayDeeplinkWrapper } from '@/components/app/userActionVotingDay/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionVotingDayDeepLink({ params }: PageProps) {
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
