import { UserActionFormCallCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormCallCongressperson/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'

export const revalidate = 3600
export const dynamic = 'error'

export default function UserActionCallCongresspersonDeepLink() {
  return (
    <div className={dialogContentPaddingStyles}>
      <UserActionFormCallCongresspersonDeeplinkWrapper />
    </div>
  )
}
