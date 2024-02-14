import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVoterRegistrationDeeplinkWrapper } from '@/components/app/userActionFormVoterRegistration/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionVoterRegistrationDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormVoterRegistrationDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
