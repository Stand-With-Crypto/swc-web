import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVoterRegistrationDeeplinkWrapper } from '@/components/app/userActionFormVoterRegistration/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionVoterRegistrationDeepLink({ params }: PageProps) {
  return (
    <ErrorBoundary
      extras={{
        action: {
          isDeeplink: true,
          actionType: UserActionType.VOTER_REGISTRATION,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionVoterRegistrationDeepLink',
      }}
    >
      <HomepageDialogDeeplinkLayout pageParams={params}>
        <div className={cn(dialogContentPaddingStyles, 'h-full')}>
          <UserActionFormVoterRegistrationDeeplinkWrapper />
        </div>
      </HomepageDialogDeeplinkLayout>
    </ErrorBoundary>
  )
}
