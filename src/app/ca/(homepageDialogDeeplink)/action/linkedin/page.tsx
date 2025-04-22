import { UserActionType } from '@prisma/client'

import { UserActionFormShareOnLinkedInDeeplinkWrapper } from '@/components/app/userActionFormFollowOnLinkedIn/common/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

const countryCode = SupportedCountryCodes.CA

export default function CAUserActionShareOnLinkedInDeepLink() {
  return (
    <div className={cn(dialogContentPaddingStyles, 'h-full')}>
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.LINKEDIN,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionShareOnLinkedInDeepLink',
        }}
      >
        <UserActionFormShareOnLinkedInDeeplinkWrapper countryCode={countryCode} />
      </ErrorBoundary>
    </div>
  )
}
