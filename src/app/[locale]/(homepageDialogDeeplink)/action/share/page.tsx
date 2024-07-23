import { UserActionFormShareOnTwitterDeeplinkWrapper } from '@/components/app/userActionFormShareOnTwitter/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { cn } from '@/utils/web/cn'

export default function UserActionShareOnTwitterDeepLink() {
  return (
    <div className={cn(dialogContentPaddingStyles, 'h-full')}>
      <UserActionFormShareOnTwitterDeeplinkWrapper />
    </div>
  )
}
