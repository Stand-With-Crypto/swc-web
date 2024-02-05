import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'

export const revalidate = 3600
export const dynamic = 'error'

export default function UserActionEmailCongresspersonDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormEmailCongresspersonDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
