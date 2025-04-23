import { UserActionType } from '@prisma/client'

import { ErrorBoundary } from '@/utils/web/errorBoundary'
import { AUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/au'
import { UserActionViewKeyPageDeeplinkWrapper } from '@/components/app/userActionFormViewKeyPage/homepageDialogDeeplinkWrapper'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionEmailCongresspersonDeepLink() {
  return (
    <AUHomepageDialogDeeplinkLayout className="max-w-xl">
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
    </AUHomepageDialogDeeplinkLayout>
  )
}
