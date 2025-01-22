'use client'
import { SMSStatus } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { SMSOptInCTA } from '@/components/app/smsOptInCTA'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

export interface UnauthenticatedHeroCTAProps {
  ctaText: string
}

export interface AuthenticatedHeroCTAProps {
  finishProfileText: string
  viewProfileText: string
}

export interface HeroCTAProps {
  unauthenticatedProps: UnauthenticatedHeroCTAProps
  authenticatedProps: AuthenticatedHeroCTAProps
}

export function HeroCTA({ unauthenticatedProps, authenticatedProps }: HeroCTAProps) {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()

  const user = profileReq.data?.user

  const unauthenticatedContent = (
    <Button size="lg" variant="primary-cta">
      {unauthenticatedProps?.ctaText ?? 'Join now'}
    </Button>
  )

  const getAuthenticatedContent = () => {
    if (!user) {
      return unauthenticatedContent
    }

    if (
      !user.phoneNumber ||
      [SMSStatus.NOT_OPTED_IN, SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN].includes(user.smsStatus)
    ) {
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
              },
            })
          }
        />
      )
    }

    return (
      <Button asChild size="lg" variant="primary-cta">
        {hasCompleteUserProfile(user) ? (
          <InternalLink href={urls.profile()}>
            {authenticatedProps?.viewProfileText ?? 'View profile'}
          </InternalLink>
        ) : (
          <InternalLink
            href={`${urls.profile()}?${OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY}=true`}
          >
            {authenticatedProps?.finishProfileText ?? 'Finish profile'}
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
