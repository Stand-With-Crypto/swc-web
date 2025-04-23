import { UserActionType } from '@prisma/client'

import { ErrorBoundary } from '@/utils/web/errorBoundary'
import { GBHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/gb'
import { UserActionViewKeyPageDeeplinkWrapper } from '@/components/app/userActionFormViewKeyPage/homepageDialogDeeplinkWrapper'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionEmailCongresspersonDeepLink() {
  return (
    <GBHomepageDialogDeeplinkLayout>
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.VIEW_KEY_PAGE,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionEmailCongresspersonDeepLink',
        }}
      >
        <UserActionViewKeyPageDeeplinkWrapper />
      </ErrorBoundary>
    </GBHomepageDialogDeeplinkLayout>
  )
}
