import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVoterRegistrationDeeplinkWrapper } from '@/components/app/userActionFormVoterRegistration/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionVoterRegistrationDeepLink(props: PageProps) {
  const params = await props.params
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
