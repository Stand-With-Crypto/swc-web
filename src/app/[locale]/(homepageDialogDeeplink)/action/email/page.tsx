import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { usePreventIOSOverscroll } from '@/hooks/usePreventIOSOverscroll'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionEmailCongresspersonDeepLink({ params }: PageProps) {
  usePreventIOSOverscroll()

  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormEmailCongresspersonDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
