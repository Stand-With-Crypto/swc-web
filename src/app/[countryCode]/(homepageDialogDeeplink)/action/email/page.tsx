import { UserActionType } from '@prisma/client'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { ErrorBoundary } from '@/utils/web/errorBoundary'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

const countryCode = SupportedCountryCodes.US

export default async function UserActionEmailCongresspersonDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <USHomepageDialogDeeplinkLayout pageParams={params}>
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
    </USHomepageDialogDeeplinkLayout>
  )
}
