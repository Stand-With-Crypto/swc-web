import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionEmailCongresspersonDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormEmailCongresspersonDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
