import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVoterAttestationDeeplinkWrapper } from '@/components/app/userActionFormVoterAttestation/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionVoterAttestationDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormVoterAttestationDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
