import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVoterAttestationDeeplinkWrapper } from '@/components/app/userActionFormVoterAttestation/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionVoterAttestationDeepLink({ params }: PageProps) {
  return (
    <ErrorBoundary
      extras={{
        action: {
          isDeeplink: true,
          actionType: UserActionType.VOTER_ATTESTATION,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionVoterAttestationDeepLink',
      }}
    >
      <HomepageDialogDeeplinkLayout pageParams={params}>
        <UserActionFormVoterAttestationDeeplinkWrapper />
      </HomepageDialogDeeplinkLayout>
    </ErrorBoundary>
  )
}
