import { UserActionType } from '@prisma/client'

import { AUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/au'
import { UserActionLetterRootPageDeeplinkWrapper } from '@/components/app/userActionFormLetter/homepageRootDialogDeeplinkWrapper'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export default async function UserActionLetterDeepLink() {
  return (
    <AUHomepageDialogDeeplinkLayout>
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.LETTER,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionLetterDeepLink',
        }}
      >
        <UserActionLetterRootPageDeeplinkWrapper />
      </ErrorBoundary>
    </AUHomepageDialogDeeplinkLayout>
  )
}

