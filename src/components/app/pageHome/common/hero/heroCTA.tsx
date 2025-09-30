'use client'
import { SMSStatus } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { SMSOptInCTA } from '@/components/app/sms/smsOptInCTA'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      joinTheMovement: 'Join the Movement',
      signThePetition: 'Sign the Petition',
      signUpForPitchFest: 'Sign Up for Pitch Fest',
      viewProfile: 'View Profile',
      finishProfile: 'Finish your profile',
    },
    de: {
      joinTheMovement: 'Schließe dich der Bewegung an',
      signThePetition: 'Petition unterschreiben',
      signUpForPitchFest: 'Pitch Fest anmelden',
      viewProfile: 'Profil ansehen',
      finishProfile: 'Profil vervollständigen',
    },
    fr: {
      joinTheMovement: 'Rejoignez le mouvement',
      signThePetition: 'Signer la pétition',
      signUpForPitchFest: "S'inscrire pour Pitch Fest",
      viewProfile: 'Voir le profil',
      finishProfile: 'Terminer le profil',
    },
  },
  messagesOverrides: {
    us: {
      en: {
        joinTheMovement: 'Join the fight',
      },
    },
  },
})

export function HeroCTA({
  countryCode,
  darkMode = false,
}: {
  countryCode: SupportedCountryCodes
  darkMode?: boolean
}) {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const { t } = useTranslation(i18nMessages, 'FooterHeroCTA')

  const user = profileReq.data?.user

  const unauthenticatedContent = (
    <Button size="lg" variant="primary-cta">
      {t('joinTheMovement')}
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

    // TODO: this became an upsell surface, let's make it an actual abstraction on the Hero component
    if (countryCode === SupportedCountryCodes.GB) {
      return (
        <Button asChild size="lg" variant="primary-cta">
          <ExternalLink href="https://petition.parliament.uk/petitions/730568">
            {t('signThePetition')}
          </ExternalLink>
        </Button>
      )
    }

    if (countryCode === SupportedCountryCodes.AU) {
      return (
        <Button asChild size="lg" variant="primary-cta">
          <InternalLink href={urls.pitchFest()}>{t('signUpForPitchFest')}</InternalLink>
        </Button>
      )
    }

    if (hasCompleteUserProfile(user)) {
      return (
        <Button asChild size="lg" variant="primary-cta">
          <InternalLink href={urls.profile()}>{t('viewProfile')}</InternalLink>
        </Button>
      )
    }

    return (
      <Button asChild size="lg" variant="primary-cta">
        <InternalLink
          href={`${urls.profile()}?${OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY}=true`}
        >
          {t('finishProfile')}
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
