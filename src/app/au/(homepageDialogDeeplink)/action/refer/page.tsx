import { UserActionType } from '@prisma/client'

import { AUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/au'
import { UserActionFormReferDeeplinkWrapper } from '@/components/app/userActionFormRefer/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

const countryCode = SupportedCountryCodes.AU

export default async function UserActionReferDeepLink() {
  return (
    <AUHomepageDialogDeeplinkLayout className="max-w-xl">
      <div className={cn(dialogContentPaddingStyles, 'h-full')}>
        <ErrorBoundary
          extras={{
            action: {
              isDeeplink: true,
              actionType: UserActionType.REFER,
            },
          }}
          severityLevel="error"
          tags={{
            domain: 'UserActionReferDeepLink',
          }}
        >
          <UserActionFormReferDeeplinkWrapper countryCode={countryCode} />
        </ErrorBoundary>
      </div>
    </AUHomepageDialogDeeplinkLayout>
  )
}
