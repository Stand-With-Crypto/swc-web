import { UserActionType } from '@prisma/client'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { UserActionEmailCongresspersonRootPageDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageRootDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export default async function UserActionEmailDeepLink(props: PageProps) {
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
        <UserActionEmailCongresspersonRootPageDeeplinkWrapper />
      </ErrorBoundary>
    </USHomepageDialogDeeplinkLayout>
  )
}
