import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVoterAttestationDeeplinkWrapper } from '@/components/app/userActionFormVoterAttestation/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionVoterAttestationDeepLink(props: PageProps) {
  const params = await props.params
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
