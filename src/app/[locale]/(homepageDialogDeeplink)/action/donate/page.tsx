import { UserActionFormDonateDeeplinkWrapper } from '@/components/app/userActionFormDonate/homepageDialogDeeplinkWrapper'

export const revalidate = 3600
export const dynamic = 'error'

export default function UserActionDonateDeepLink() {
  return <UserActionFormDonateDeeplinkWrapper />
}
