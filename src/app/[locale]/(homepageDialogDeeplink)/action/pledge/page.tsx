import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVoterAttestationDeeplinkWrapper } from '@/components/app/userActionFormVoterAttestation/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionVoterAttestationDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormVoterAttestationDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
