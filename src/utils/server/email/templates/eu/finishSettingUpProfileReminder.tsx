import * as React from 'react'
import { Img, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import { KeepUpTheFightSectionProps } from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { EUEmailTemplateProps } from '@/utils/server/email/templates/eu/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

import { EUWrapper } from './wrapper'

type FinishSettingUpProfileReminderEmailProps = KeepUpTheFightSectionProps & EUEmailTemplateProps

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      heading: 'Finish setting up your profile',
      body1:
        'Thank you for signing up to be a Stand With Crypto advocate. As a reminder, please take just a few moments to finish setting up your full profile with SWC.',
      body2:
        "Adding additional information will unlock benefits with SWC, like NFTs and even more opportunities to engage with the pro-crypto movement we're building.",
      body3:
        'Setting up your profile takes just a few minutes, and is easy to do on our site. Thank you so much for standing with crypto and being a part of this movement.',
      buttonText: 'Finish your profile',
      subjectLine: 'Finish setting up your profile',
    },
    fr: {
      heading: 'Terminez la configuration de votre profil',
      body1:
        'Merci de vous être inscrit pour devenir un défenseur de Stand With Crypto. Pour rappel, veuillez prendre quelques instants pour terminer la configuration de votre profil complet avec SWC.',
      body2:
        "L'ajout d'informations supplémentaires débloquera des avantages avec SWC, comme des NFT et encore plus d'opportunités de vous engager avec le mouvement pro-crypto que nous construisons.",
      body3:
        'La configuration de votre profil ne prend que quelques minutes et est facile à faire sur notre site. Merci beaucoup de soutenir la crypto et de faire partie de ce mouvement.',
      buttonText: 'Terminer votre profil',
      subjectLine: 'Terminez la configuration de votre profil',
    },
    de: {
      heading: 'Vervollständigen Sie die Einrichtung Ihres Profils',
      body1:
        'Vielen Dank, dass Sie sich als Stand With Crypto-Befürworter angemeldet haben. Zur Erinnerung: Nehmen Sie sich bitte nur ein paar Momente Zeit, um die Einrichtung Ihres vollständigen Profils mit SWC abzuschließen.',
      body2:
        'Das Hinzufügen zusätzlicher Informationen wird Vorteile mit SWC freischalten, wie NFTs und noch mehr Möglichkeiten, sich mit der Pro-Krypto-Bewegung zu engagieren, die wir aufbauen.',
      body3:
        'Die Einrichtung Ihres Profils dauert nur wenige Minuten und ist auf unserer Website einfach zu erledigen. Vielen Dank, dass Sie sich für Krypto einsetzen und Teil dieser Bewegung sind.',
      buttonText: 'Profil vervollständigen',
      subjectLine: 'Vervollständigen Sie die Einrichtung Ihres Profils',
    },
  },
})

const EUFinishSettingUpProfileReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  countryCode = SupportedCountryCodes.EU,
  language = SupportedLanguages.EN,
}: FinishSettingUpProfileReminderEmailProps) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  const hydratedHrefSearchParams = {
    utm_campaign: EUFinishSettingUpProfileReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <EUWrapper
      countryCode={countryCode}
      hrefSearchParams={hydratedHrefSearchParams}
      previewText={previewText}
    >
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/eu/email/swc-join-still.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">{t('heading')}</Heading>

        <Text className="text-foreground-muted text-center text-base">
          {t('body1')}
          <br />
          <br />
          {t('body2')}
          <br />
          <br />
          {t('body3')}
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl(`/eu/${language}/profile`, {
            hasOpenUpdateUserProfileForm: true,
            ...hydratedHrefSearchParams,
          })}
        >
          {t('buttonText')}
        </Button>
      </Section>
    </EUWrapper>
  )
}

EUFinishSettingUpProfileReminderEmail.getSubjectLine = (
  language: SupportedLanguages,
  countryCode: SupportedCountryCodes,
) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)
  return t('subjectLine')
}

EUFinishSettingUpProfileReminderEmail.subjectLine = 'Finish setting up your profile'
EUFinishSettingUpProfileReminderEmail.campaign = 'finish_setting_up_profile'

export default EUFinishSettingUpProfileReminderEmail
