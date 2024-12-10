import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailDebateDeeplinkWrapper } from '@/components/app/userActionFormEmailDebate/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionEmailDebateDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormEmailDebateDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
