import { getAuthenticatedData } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { RedirectToSignUpComponent } from '@/components/app/redirectToSignUp'
import { PageProps } from '@/types'

import { PageBecomeMember } from './pageBecomeMember'

export const dynamic = 'force-dynamic'

export default async function UserActionBecomeMemberDeepLink(props: PageProps) {
  const params = await props.params
  const { locale } = params
  const user = await getAuthenticatedData()

  if (!user) {
    return <RedirectToSignUpComponent callbackDestination="becomeMember" locale={locale} />
  }

  return <PageBecomeMember hasOptedInToMembership={user.hasOptedInToMembership} />
}
