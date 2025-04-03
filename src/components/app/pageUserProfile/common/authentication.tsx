import { UserActionType } from '@prisma/client'

import { getAuthenticatedData } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { RedirectToSignUpComponent } from '@/components/app/redirectToSignUp'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { PageProps } from '@/types'
import { getSearchParam } from '@/utils/server/searchParams'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function AuthRedirect({
  countryCode,
  searchParams,
}: {
  countryCode: SupportedCountryCodes
  searchParams: Awaited<PageProps['searchParams']>
}) {
  const { value: hasOpenUpdateUserProfileFormSearchParam } = getSearchParam({
    searchParams,
    queryParamKey: OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY,
  })

  return (
    <RedirectToSignUpComponent
      callbackDestination={
        hasOpenUpdateUserProfileFormSearchParam === 'true' ? 'updateProfile' : 'home'
      }
      countryCode={countryCode}
    />
  )
}

export function getIsUserSignedIn(user: Awaited<ReturnType<typeof getAuthenticatedData>>) {
  if (!user) {
    return false
  }

  return user?.userActions?.some(userAction => userAction.actionType === UserActionType.OPT_IN)
}
