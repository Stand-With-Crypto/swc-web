import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionEmailCongresspersonDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
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
        <UserActionFormEmailCongresspersonDeeplinkWrapper />
      </ErrorBoundary>
    </HomepageDialogDeeplinkLayout>
  )
}
