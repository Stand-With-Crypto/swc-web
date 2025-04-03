import { UserActionType } from '@prisma/client'

import { UserActionFormShareOnTwitterDeeplinkWrapper } from '@/components/app/userActionFormShareOnTwitter/common/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export default function UserActionShareOnTwitterDeepLink() {
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
