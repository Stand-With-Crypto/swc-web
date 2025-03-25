import { UserActionType } from '@prisma/client'

import { UserActionFormShareOnTwitterDeeplinkWrapper } from '@/components/app/userActionFormShareOnTwitter/common/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

const countryCode = SupportedCountryCodes.CA

export default function CAUserActionShareOnTwitterDeepLink() {
  return (
    <div className={cn(dialogContentPaddingStyles, 'h-full')}>
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
        <UserActionFormShareOnTwitterDeeplinkWrapper countryCode={countryCode} />
      </ErrorBoundary>
    </div>
  )
}
