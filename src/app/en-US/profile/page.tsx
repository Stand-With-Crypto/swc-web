import { UserActionType } from '@prisma/client'
import { Metadata } from 'next'

import { PageUserProfile } from '@/components/app/pageUserProfile'
import { getAuthenticatedData } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { RedirectToSignUpComponent } from '@/components/app/redirectToSignUp'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getSearchParam } from '@/utils/server/searchParams'

export const dynamic = 'force-dynamic'

type Props = PageProps

const title = 'Your Stand With Crypto profile'
const description = `See what actions you can take to help promote innovation.`
export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function Profile(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { locale } = params
  const user = await getAuthenticatedData()
  const hasOptInUserAction = user?.userActions?.some(
    userAction => userAction.actionType === UserActionType.OPT_IN,
  )

  if (!user || (user && !hasOptInUserAction)) {
    const { value } = getSearchParam({
      searchParams,
      queryParamKey: OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY,
    })

    return (
      <RedirectToSignUpComponent
        callbackDestination={value === 'true' ? 'updateProfile' : 'home'}
        locale={locale}
      />
    )
  }

  return <PageUserProfile params={params} user={user} />
}
