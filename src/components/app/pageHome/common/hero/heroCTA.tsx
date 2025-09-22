'use client'
import { SMSStatus } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { SMSOptInCTA } from '@/components/app/sms/smsOptInCTA'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

function getCountryCTA(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return 'Join the fight'
    case SupportedCountryCodes.AU:
      return 'Join the Movement'
    case SupportedCountryCodes.CA:
      return 'Join the Movement'
    case SupportedCountryCodes.GB:
      return 'Join the Movement'
    default:
      return 'Join the fight'
  }
}

export function HeroCTA({
  countryCode,
  ctaText = getCountryCTA(countryCode),
  darkMode = false,
}: {
  countryCode: SupportedCountryCodes
  ctaText?: string
  darkMode?: boolean
}) {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()

  const user = profileReq.data?.user

  const unauthenticatedContent = (
    <Button size="lg" variant="primary-cta">
      {ctaText}
    </Button>
  )

  const getAuthenticatedContent = () => {
    if (!user) {
      return unauthenticatedContent
    }

    if (
      (!user.phoneNumber ||
        [SMSStatus.NOT_OPTED_IN, SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN].includes(
          user.smsStatus,
        )) &&
      isSmsSupportedInCountry(countryCode)
    ) {
      return (
        <SMSOptInCTA
          darkMode={darkMode}
          onSuccess={({ phoneNumber }) =>
            void profileReq.mutate({
              user: {
                ...profileReq.data!.user!,
                phoneNumber,
              },
            })
          }
          user={user}
        />
      )
    }

    if (countryCode === SupportedCountryCodes.GB) {
      return (
        <Button asChild size="lg" variant="primary-cta">
          <ExternalLink href="https://petition.parliament.uk/petitions/730568">
            Sign the Petition
          </ExternalLink>
        </Button>
      )
    }

    if (hasCompleteUserProfile(user)) {
      return (
        <Button asChild size="lg" variant="primary-cta">
          <InternalLink href={urls.profile()}>View Profile</InternalLink>
        </Button>
      )
    }

    return (
      <Button asChild size="lg" variant="primary-cta">
        <InternalLink
          href={`${urls.profile()}?${OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY}=true`}
        >
          Finish your profile
        </InternalLink>
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
