import { UserActionType } from '@prisma/client'
import { redirect, RedirectType } from 'next/navigation'

import { getAuthenticatedData } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { PageProps } from '@/types'
import { setCallbackQueryString } from '@/utils/server/searchParams'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'

import { PageBecomeMember } from './pageBecomeMember'

export const dynamic = 'force-dynamic'

export default async function UserActionBecomeMemberDeepLink({ params }: PageProps) {
  const { locale } = params
  const user = await getAuthenticatedData()
  console.log('page')

  if (!user) {
    redirect(
      USER_ACTION_DEEPLINK_MAP[UserActionType.OPT_IN].getDeeplinkUrl({
        locale,
        queryString: setCallbackQueryString({ destination: 'becomeMember' }),
      }),
      RedirectType.replace,
    )
  }

  return <PageBecomeMember hasOptedInToMembership={user.hasOptedInToMembership} />
}
