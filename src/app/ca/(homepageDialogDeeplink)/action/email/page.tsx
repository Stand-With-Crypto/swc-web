import { UserActionType } from '@prisma/client'

import { ErrorBoundary } from '@/utils/web/errorBoundary'
import { CAHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/ca'
import { UserActionViewKeyPageDeeplinkWrapper } from '@/components/app/userActionFormViewKeyPage/homepageDialogDeeplinkWrapper'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionEmailCongresspersonDeepLink() {
  return (
    <CAHomepageDialogDeeplinkLayout className="max-w-xl">
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
    </CAHomepageDialogDeeplinkLayout>
  )
}
