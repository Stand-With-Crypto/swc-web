import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVoterRegistrationDeeplinkWrapper } from '@/components/app/userActionFormVoterRegistration/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'

export const revalidate = 3600
export const dynamic = 'error'

export default function UserActionVoterRegistrationDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormVoterRegistrationDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
