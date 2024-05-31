'use client'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { SMSOptInCTA } from '@/components/app/smsOptInCTA'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

export function HeroCTA() {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()

  const user = profileReq.data?.user

  const unauthenticatedContent = (
    <Button size="lg" variant="primary-cta">
      Join the fight
    </Button>
  )

  const getAuthenticatedContent = () => {
    if (!user) {
      return unauthenticatedContent
    }

    if (!user.phoneNumber || !user.hasOptedInToSms) {
      return (
        <SMSOptInCTA
          initialValues={{
            phoneNumber: user.phoneNumber,
          }}
          onSuccess={({ phoneNumber }) =>
            void profileReq.mutate({
              user: {
                ...profileReq.data!.user!,
                phoneNumber,
                hasOptedInToSms: true,
              },
            })
          }
        />
      )
    }

    return (
      <Button asChild size="lg" variant="primary-cta">
        {hasCompleteUserProfile(user) ? (
          <InternalLink href={urls.profile()}>View Profile</InternalLink>
        ) : (
          <InternalLink
            href={`${urls.profile()}?${OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY}=true`}
          >
            Finish your profile
          </InternalLink>
        )}
      </Button>
    )
  }

  return (
    <LoginDialogWrapper
      authenticatedContent={getAuthenticatedContent()}
      loadingFallback={unauthenticatedContent}
    >
      {unauthenticatedContent}
    </LoginDialogWrapper>
  )
}
