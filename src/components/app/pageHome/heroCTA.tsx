'use client'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useLocale } from '@/hooks/useLocale'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

export function HeroCTA() {
  const locale = useLocale()

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
        <Button asChild size="lg" variant="primary-cta">
          {profileReq.data?.user && hasCompleteUserProfile(profileReq.data?.user) ? (
            <InternalLink
              href={USER_ACTION_DEEPLINK_MAP.EMAIL.getDeeplinkUrl({
                locale,
              })}
            >
              Email your Rep
            </InternalLink>
          ) : (
            <InternalLink
              href={`${urls.profile()}?${OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY}=true`}
            >
              Finish your profile
            </InternalLink>
          )}
        </Button>
      }
      loadingFallback={unauthenticatedContent}
    >
      {unauthenticatedContent}
    </LoginDialogWrapper>
  )
}
