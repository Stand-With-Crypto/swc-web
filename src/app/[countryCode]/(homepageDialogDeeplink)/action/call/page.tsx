import { UserActionType } from '@prisma/client'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { UserActionFormCallCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormCallCongressperson/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionCallCongresspersonDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <USHomepageDialogDeeplinkLayout pageParams={params}>
      <div className={cn('max-md:h-full', dialogContentPaddingStyles)}>
        <ErrorBoundary
          extras={{
            action: {
              isDeeplink: true,
              actionType: UserActionType.CALL,
            },
          }}
          severityLevel="error"
          tags={{
            domain: 'UserActionCallCongresspersonDeepLink',
          }}
        >
          <UserActionFormCallCongresspersonDeeplinkWrapper />
        </ErrorBoundary>
      </div>
    </USHomepageDialogDeeplinkLayout>
  )
}
