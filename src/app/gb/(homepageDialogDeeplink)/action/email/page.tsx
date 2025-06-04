import { UserActionType } from '@prisma/client'

import { GBHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/gb'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

const countryCode = SupportedCountryCodes.GB

export default async function UserActionEmailCongresspersonDeepLink() {
  return (
    <GBHomepageDialogDeeplinkLayout>
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
        <UserActionFormEmailCongresspersonDeeplinkWrapper countryCode={countryCode} />
      </ErrorBoundary>
    </GBHomepageDialogDeeplinkLayout>
  )
}
