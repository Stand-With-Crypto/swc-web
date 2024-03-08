'use client'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
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
        profileReq.data?.user ? (
          <Button asChild size="lg" variant="primary-cta">
            {hasCompleteUserProfile(profileReq?.data?.user) ? (
              <InternalLink href={urls.profile()}>View Profile</InternalLink>
            ) : (
              <InternalLink
                href={`${urls.profile()}?${OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY}=true`}
              >
                Finish your profile
              </InternalLink>
            )}
          </Button>
        ) : (
          unauthenticatedContent
        )
      }
      loadingFallback={unauthenticatedContent}
    >
      {unauthenticatedContent}
    </LoginDialogWrapper>
  )
}
