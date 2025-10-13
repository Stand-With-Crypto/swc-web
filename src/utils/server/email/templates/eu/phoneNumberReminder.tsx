import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { EUEmailTemplateProps } from '@/utils/server/email/templates/eu/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

import { EUWrapper } from './wrapper'

type PhoneNumberReminderEmailProps = KeepUpTheFightSectionProps & EUEmailTemplateProps

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      heading: 'Get text updates on crypto policy and invites to local events',
      body1:
        "Thank you for signing up to be a Stand With Crypto advocate. We're reaching out to encourage you to take your advocacy to the next level by adding a phone number to receive text messages from SWC.",
      body2:
        "You'll receive updates on key crypto bills, exclusive events, and opportunities for advocacy. We promise to only reach out when it's important.",
      body3: 'SWC will never use your phone number for commercial purposes, and we have a robust',
      privacyPolicy: 'privacy policy',
      body4: 'that outlines the ways we use any information you provide us.',
      buttonText: 'Get text updates',
      subjectLine: 'Get text updates from SWC',
    },
    fr: {
      heading:
        'Recevez des mises à jour par SMS sur la politique crypto et des invitations aux événements locaux',
      body1:
        'Merci de vous être inscrit pour devenir un défenseur de Stand With Crypto. Nous vous contactons pour vous encourager à porter votre engagement au niveau supérieur en ajoutant un numéro de téléphone pour recevoir des SMS de SWC.',
      body2:
        "Vous recevrez des mises à jour sur les principales lois crypto, des événements exclusifs et des opportunités d'engagement. Nous promettons de ne vous contacter que lorsque c'est important.",
      body3:
        "SWC n'utilisera jamais votre numéro de téléphone à des fins commerciales, et nous avons une",
      privacyPolicy: 'politique de confidentialité',
      body4:
        'robuste qui décrit les façons dont nous utilisons les informations que vous nous fournissez.',
      buttonText: 'Recevoir les mises à jour par SMS',
      subjectLine: 'Recevoir les mises à jour par SMS de SWC',
    },
    de: {
      heading:
        'Erhalten Sie SMS-Updates zur Kryptopolitik und Einladungen zu lokalen Veranstaltungen',
      body1:
        'Vielen Dank, dass Sie sich als Stand With Crypto-Befürworter angemeldet haben. Wir wenden uns an Sie, um Sie zu ermutigen, Ihr Engagement auf die nächste Stufe zu heben, indem Sie eine Telefonnummer hinzufügen, um SMS von SWC zu erhalten.',
      body2:
        'Sie erhalten Updates zu wichtigen Krypto-Gesetzen, exklusiven Veranstaltungen und Möglichkeiten zur Interessenvertretung. Wir versprechen, Sie nur zu kontaktieren, wenn es wichtig ist.',
      body3:
        'SWC wird Ihre Telefonnummer niemals für kommerzielle Zwecke verwenden, und wir haben eine umfassende',
      privacyPolicy: 'Datenschutzrichtlinie',
      body4:
        'die die Arten beschreibt, wie wir die von Ihnen bereitgestellten Informationen verwenden.',
      buttonText: 'SMS-Updates erhalten',
      subjectLine: 'SMS-Updates von SWC erhalten',
    },
  },
})

const EUPhoneNumberReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  countryCode = SupportedCountryCodes.EU,
  language = SupportedLanguages.EN,
  ...keepUpTheFightSectionProps
}: PhoneNumberReminderEmailProps) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  const hydratedHrefSearchParams = {
    utm_campaign: EUPhoneNumberReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <EUWrapper
      countryCode={countryCode}
      hrefSearchParams={hydratedHrefSearchParams}
      language={language}
      previewText={previewText}
    >
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/eu/email/phone-banner.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">{t('heading')}</Heading>

        <Text className="text-foreground-muted text-center text-base">
          {t('body1')}
          <br />
          <br />
          {t('body2')}
          <br />
          <br />
          {t('body3')}{' '}
          <Button
            color="primary-cta"
            href={buildTemplateInternalUrl(`/eu/${language}/privacy`, hydratedHrefSearchParams)}
            noPadding
            variant="link"
          >
            {t('privacyPolicy')}
          </Button>{' '}
          {t('body4')}
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

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={countryCode}
        hrefSearchParams={hydratedHrefSearchParams}
        language={language}
      />
    </EUWrapper>
  )
}

EUPhoneNumberReminderEmail.getSubjectLine = (
  language: SupportedLanguages,
  countryCode: SupportedCountryCodes,
) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)
  return t('subjectLine')
}

EUPhoneNumberReminderEmail.subjectLine = 'Get text updates from SWC'
EUPhoneNumberReminderEmail.campaign = 'phone_number_reminder'

export default EUPhoneNumberReminderEmail
