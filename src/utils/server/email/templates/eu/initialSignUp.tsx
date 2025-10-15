import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { EUEmailTemplateProps } from '@/utils/server/email/templates/eu/constants'
import { EUWrapper } from '@/utils/server/email/templates/eu/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

type InitialSignUpEmailProps = KeepUpTheFightSectionProps & EUEmailTemplateProps

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      thanksForJoining: 'Thanks for joining!',
      body1:
        'Thank you for signing up to be a Stand With Crypto advocate. Crypto advocates like you are making a huge difference in the European Union, from your local community to European Parliament.',
      body2:
        "Stand With Crypto advocates have helped bring crypto to the forefront of political campaigns, while highlighting the real-world uses of crypto that make a difference in European citizens' everyday lives.",
      body3:
        "Keep an eye out for more communications from us: you'll see updates on key news stories we're tracking, events in your local area, and opportunities for you to raise your voice to your elected officials.",
      body4: "Together, we're making a difference for crypto. Thank you for standing with us.",
      subjectLine: 'Thanks for joining SWC!',
    },
    fr: {
      thanksForJoining: 'Merci de nous avoir rejoints !',
      body1:
        "Merci de vous être inscrit pour devenir un défenseur de Stand With Crypto. Des défenseurs de la crypto comme vous font une énorme différence dans l'Union européenne, de votre communauté locale au Parlement européen.",
      body2:
        'Les défenseurs de Stand With Crypto ont contribué à mettre la crypto au premier plan des campagnes politiques, tout en mettant en lumière les utilisations concrètes de la crypto qui font une différence dans la vie quotidienne des citoyens européens.',
      body3:
        "Restez à l'affût de nos prochaines communications : vous verrez des mises à jour sur les principales actualités que nous suivons, des événements dans votre région, et des opportunités pour faire entendre votre voix auprès de vos représentants élus.",
      body4: 'Ensemble, nous faisons la différence pour la crypto. Merci de nous soutenir.',
      subjectLine: 'Merci de nous avoir rejoints SWC !',
    },
    de: {
      thanksForJoining: 'Danke, dass Sie beigetreten sind!',
      body1:
        'Vielen Dank, dass Sie sich als Stand With Crypto-Befürworter angemeldet haben. Krypto-Befürworter wie Sie machen einen großen Unterschied in der Europäischen Union, von Ihrer lokalen Gemeinschaft bis zum Europäischen Parlament.',
      body2:
        'Stand With Crypto-Befürworter haben dazu beigetragen, Krypto in den Mittelpunkt politischer Kampagnen zu rücken und gleichzeitig die realen Anwendungen von Krypto hervorzuheben, die einen Unterschied im Alltag der europäischen Bürger machen.',
      body3:
        'Halten Sie Ausschau nach weiteren Mitteilungen von uns: Sie werden Updates zu wichtigen Nachrichten, die wir verfolgen, Veranstaltungen in Ihrer Nähe und Möglichkeiten sehen, Ihre Stimme gegenüber Ihren gewählten Vertretern zu erheben.',
      body4:
        'Gemeinsam machen wir einen Unterschied für Krypto. Vielen Dank, dass Sie mit uns stehen.',
      subjectLine: 'Danke, dass Sie SWC beigetreten sind!',
    },
  },
})

const EUInitialSignUpEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  countryCode = SupportedCountryCodes.EU,
  language = SupportedLanguages.EN,
  ...keepUpTheFightSectionProps
}: InitialSignUpEmailProps) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  const hydratedHrefSearchParams = {
    utm_campaign: EUInitialSignUpEmail.campaign,
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
          src={buildTemplateInternalUrl('/eu/email/join-banner.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">{t('thanksForJoining')}</Heading>

        <Text className="text-foreground-muted text-center text-base">
          {t('body1')}
          <br />
          <br />
          {t('body2')}
          <br />
          <br />
          {t('body3')}
          <br />
          <br />
          {t('body4')}
        </Text>
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

EUInitialSignUpEmail.getSubjectLine = (
  language: SupportedLanguages,
  countryCode: SupportedCountryCodes,
) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)
  return t('subjectLine')
}

EUInitialSignUpEmail.subjectLine = 'Thanks for joining SWC!'
EUInitialSignUpEmail.campaign = 'initial_signup'

export default EUInitialSignUpEmail
