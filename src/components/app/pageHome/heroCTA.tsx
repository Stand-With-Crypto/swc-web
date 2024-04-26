'use client'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useSession } from '@/hooks/useSession'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

export function HeroCTA() {
  const profileReq = useApiResponseForUserFullProfileInfo()

  const urls = useIntlUrls()

  const unauthenticatedContent = (
    <Button size="lg" variant="primary-cta">
      Join the fight
    </Button>
  )

  return (
    <LoginDialogWrapper
      authenticatedContent={
        profileReq.data?.user && hasCompleteUserProfile(profileReq.data?.user) ? (
          <UserActionFormEmailCongresspersonDialog>
            <Button size="lg" variant="primary-cta">
              Email your Rep
            </Button>
          </UserActionFormEmailCongresspersonDialog>
        ) : (
          <Button asChild size="lg" variant="primary-cta">
            <InternalLink
              href={`${urls.profile()}?${OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY}=true`}
            >
              Finish your profile
            </InternalLink>
          </Button>
        )
      }
      loadingFallback={unauthenticatedContent}
    >
      {unauthenticatedContent}
    </LoginDialogWrapper>
  )
}
