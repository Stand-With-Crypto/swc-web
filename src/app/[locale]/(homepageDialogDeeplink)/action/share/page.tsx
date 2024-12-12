import { UserActionType } from '@prisma/client'

import { UserActionFormShareOnTwitterDeeplinkWrapper } from '@/components/app/userActionFormShareOnTwitter/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export default function UserActionShareOnTwitterDeepLink() {
  return (
    <ErrorBoundary
      extras={{
        action: {
          isDeeplink: true,
          actionType: UserActionType.TWEET,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionShareOnTwitterDeepLink',
      }}
    >
      <div className={cn(dialogContentPaddingStyles, 'h-full')}>
        <UserActionFormShareOnTwitterDeeplinkWrapper />
      </div>
    </ErrorBoundary>
  )
}
