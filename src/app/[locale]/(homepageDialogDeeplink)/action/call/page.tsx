import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormCallCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormCallCongressperson/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { cn } from '@/utils/web/cn'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionCallCongresspersonDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div className={cn('max-md:h-full', dialogContentPaddingStyles)}>
        <UserActionFormCallCongresspersonDeeplinkWrapper />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}
