import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormDonateDeeplinkWrapper } from '@/components/app/userActionFormDonate/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'

export const revalidate = 3600
export const dynamic = 'error'

export default function UserActionDonateDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormDonateDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
