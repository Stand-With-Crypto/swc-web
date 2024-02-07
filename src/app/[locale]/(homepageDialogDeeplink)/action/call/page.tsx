import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormCallCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormCallCongressperson/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'

export const revalidate = 3600
export const dynamic = 'error'

export default function UserActionCallCongresspersonDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div className={dialogContentPaddingStyles}>
        <UserActionFormCallCongresspersonDeeplinkWrapper />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}
