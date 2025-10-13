import * as React from 'react'
import { Hr, Img, Link, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import {
  EU_SOCIAL_MEDIA_URL,
  EUEmailTemplateProps,
} from '@/utils/server/email/templates/eu/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

import { EUWrapper } from './wrapper'

type FollowOnXReminderEmailProps = KeepUpTheFightSectionProps & EUEmailTemplateProps

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      heading: 'Stay up to date on crypto policy',
      body1:
        "We're so grateful for our Stand With Crypto community members, and we want to make sure you stay connected to everything we're doing. While we strive to keep you up to date here in your inbox, another great way to get the latest news is to",
      followUsOnX: 'follow us on X',
      and: 'and',
      linkedin: 'Linkedin',
      body2:
        "X and Linkedin are where you'll get instant updates on events we're hosting, news we're reading, and awesome discussion Spaces that we host with advocates and founders across the country.",
      body3:
        "Follow us on X and you'll get it all into your feed as it comes. We can't wait to see you there!",
      buttonX: 'Follow us on X',
      buttonLinkedin: 'Follow us on Linkedin',
      subjectLine: 'Stay up to date on crypto policy',
    },
    fr: {
      heading: 'Restez informé sur la politique crypto',
      body1:
        "Nous sommes très reconnaissants envers nos membres de la communauté Stand With Crypto, et nous voulons nous assurer que vous restez connecté à tout ce que nous faisons. Bien que nous nous efforcions de vous tenir au courant ici dans votre boîte de réception, un autre excellent moyen d'obtenir les dernières nouvelles est de",
      followUsOnX: 'nous suivre sur X',
      and: 'et',
      linkedin: 'Linkedin',
      body2:
        'X et Linkedin sont les endroits où vous obtiendrez des mises à jour instantanées sur les événements que nous organisons, les actualités que nous lisons et les discussions Spaces que nous animons avec des défenseurs et des fondateurs à travers le pays.',
      body3:
        'Suivez-nous sur X et vous recevrez tout dans votre fil au fur et à mesure. Nous avons hâte de vous y voir !',
      buttonX: 'Suivez-nous sur X',
      buttonLinkedin: 'Suivez-nous sur Linkedin',
      subjectLine: 'Restez informé sur la politique crypto',
    },
    de: {
      heading: 'Bleiben Sie auf dem Laufenden über Kryptopolitik',
      body1:
        'Wir sind sehr dankbar für unsere Stand With Crypto-Community-Mitglieder und möchten sicherstellen, dass Sie mit allem, was wir tun, verbunden bleiben. Während wir uns bemühen, Sie hier in Ihrem Posteingang auf dem Laufenden zu halten, ist eine weitere großartige Möglichkeit, die neuesten Nachrichten zu erhalten,',
      followUsOnX: 'uns auf X zu folgen',
      and: 'und',
      linkedin: 'Linkedin',
      body2:
        'X und Linkedin sind die Orte, an denen Sie sofortige Updates zu den von uns veranstalteten Events, den Nachrichten, die wir lesen, und den großartigen Diskussions-Spaces erhalten, die wir mit Befürwortern und Gründern im ganzen Land veranstalten.',
      body3:
        'Folgen Sie uns auf X und Sie erhalten alles in Ihren Feed, sobald es verfügbar ist. Wir können es kaum erwarten, Sie dort zu sehen!',
      buttonX: 'Folgen Sie uns auf X',
      buttonLinkedin: 'Folgen Sie uns auf Linkedin',
      subjectLine: 'Bleiben Sie auf dem Laufenden über Kryptopolitik',
    },
  },
})

const EUFollowOnXReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  countryCode = SupportedCountryCodes.EU,
  language = SupportedLanguages.EN,
  ...keepUpTheFightSectionProps
}: FollowOnXReminderEmailProps) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  const hydratedHrefSearchParams = {
    utm_campaign: EUFollowOnXReminderEmail.campaign,
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
          src={buildTemplateInternalUrl('/eu/email/x-banner.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">{t('heading')}</Heading>

        <Text className="text-foreground-muted text-center text-base">
          {t('body1')}{' '}
          <Link className="text-inherit underline" href={EU_SOCIAL_MEDIA_URL.twitter}>
            {t('followUsOnX')}
          </Link>{' '}
          {t('and')}{' '}
          <Link className="text-inherit underline" href={EU_SOCIAL_MEDIA_URL.linkedin}>
            {t('linkedin')}
          </Link>
          .
          <br />
          <br />
          {t('body2')}
          <br />
          <br />
          <Link className="text-inherit underline" href={EU_SOCIAL_MEDIA_URL.twitter}>
            {t('followUsOnX')}
          </Link>{' '}
          {t('body3')}
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button fullWidth="mobile" href={EU_SOCIAL_MEDIA_URL.twitter}>
          {t('buttonX')}
        </Button>
        <Button
          className="mt-4 md:ml-4 md:mt-0"
          fullWidth="mobile"
          href={EU_SOCIAL_MEDIA_URL.linkedin}
        >
          {t('buttonLinkedin')}
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

EUFollowOnXReminderEmail.getSubjectLine = (
  language: SupportedLanguages,
  countryCode: SupportedCountryCodes,
) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)
  return t('subjectLine')
}

EUFollowOnXReminderEmail.subjectLine = 'Stay up to date on crypto policy'
EUFollowOnXReminderEmail.campaign = 'follow_on_x_reminder'

export default EUFollowOnXReminderEmail
