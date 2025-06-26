import { UserActionType } from '@prisma/client'

import { CAHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/ca'
import { UserActionEmailCongresspersonRootPageDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageRootDialogDeeplinkWrapper'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export default async function UserActionEmailDeepLink() {
  return (
    <CAHomepageDialogDeeplinkLayout>
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
        <UserActionEmailCongresspersonRootPageDeeplinkWrapper />
      </ErrorBoundary>
    </CAHomepageDialogDeeplinkLayout>
  )
}
