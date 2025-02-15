import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormReferDeeplinkWrapper } from '@/components/app/userActionFormRefer/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionReferDeepLink(props: PageProps) {
  const params = await props.params

  return (
    <HomepageDialogDeeplinkLayout className="max-w-xl" pageParams={params}>
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
          <UserActionFormReferDeeplinkWrapper />
        </ErrorBoundary>
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}
