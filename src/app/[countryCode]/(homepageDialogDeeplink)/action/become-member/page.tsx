import { UserActionType } from '@prisma/client'

import { getAuthenticatedData } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { RedirectToSignUpComponent } from '@/components/app/redirectToSignUp'
import { PageProps } from '@/types'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

import { PageBecomeMember } from './pageBecomeMember'

export const dynamic = 'force-dynamic'

export default async function UserActionBecomeMemberDeepLink(props: PageProps) {
  const params = await props.params
  const { countryCode } = params
  const user = await getAuthenticatedData()

  if (!user) {
    return (
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.OPT_IN,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionBecomeMemberDeepLink',
          component: 'RedirectToSignUpComponent',
        }}
      >
        <RedirectToSignUpComponent callbackDestination="becomeMember" countryCode={countryCode} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary
      extras={{
        action: {
          isDeeplink: true,
          actionType: UserActionType.OPT_IN,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionBecomeMemberDeepLink',
        component: 'PageBecomeMember',
      }}
    >
      <PageBecomeMember hasOptedInToMembership={user.hasOptedInToMembership} />
    </ErrorBoundary>
  )
}
