import * as React from 'react'
import { Column, Img, Row, Section, Text } from '@react-email/components'
import { ChevronRight } from 'lucide-react'

import {
  EmailActiveActions,
  getEmailActionsMetadataByCountry,
} from '@/utils/server/email/templates/common/constants'
import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX_KEY,
  withI18nCommons,
} from '@/utils/shared/i18n/commons'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      countryCTA: 'Join the Movement',
      dontWaitLabel:
        "Don't wait - take action now. See below for actions you can take to help keep crypto in {countryWithPrefix}",
      imgAlt: '{actionType} action icon',
    },
    fr: {
      countryCTA: 'Rejoignez le mouvement',
      dontWaitLabel:
        "N'attendez pas - agissez maintenant. Voir ci-dessous pour les actions que vous pouvez entreprendre pour aider à maintenir la crypto dans {countryWithPrefix}",
      imgAlt: "icône d'action {actionType}",
    },
    de: {
      countryCTA: 'Schließen Sie sich der Bewegung an',
      dontWaitLabel:
        'Warten Sie nicht - handeln Sie jetzt. Unten finden Sie Aktionen, die Sie unternehmen können, um die Crypto in {countryWithPrefix} zu unterstützen',
      imgAlt: '{actionType} Aktionssymbol',
    },
  },
  messagesOverrides: {
    us: {
      en: {
        countryCTA: 'Keep up the fight',
      },
    },
  },
})

export interface KeepUpTheFightSectionProps {
  completedActionTypes?: EmailActiveActions[]
  hrefSearchParams?: Record<string, unknown>
  hiddenActions?: string[]
  countryCode: SupportedCountryCodes
  ctaText?: string
  language?: SupportedLanguages
}

export function KeepUpTheFightSection({
  completedActionTypes = [],
  hrefSearchParams = {},
  hiddenActions = [],
  countryCode,
  ctaText: overrideCtaText,
  language = SupportedLanguages.EN,
}: KeepUpTheFightSectionProps) {
  const { t } = getStaticTranslation(withI18nCommons(i18nMessages), language, countryCode)

  const ctaText = overrideCtaText ?? t('countryCTA')

  const actionsMetadata = Object.entries(getEmailActionsMetadataByCountry(countryCode, language))
    .filter(([type]) => !hiddenActions.includes(type))
    .map(([type, metadata]) => ({
      ...metadata,
      hasCompleted: completedActionTypes.includes(type),
      type,
    }))
    .sort((a, b) => Number(a.hasCompleted) - Number(b.hasCompleted))

  return (
    <Section>
      <Heading as="h2" className="text-[#101828]" gutterBottom="md" size="md">
        {ctaText}
      </Heading>
      <Text className="text-center text-base text-[#5B616E]">
        {t('dontWaitLabel', {
          countryWithPrefix: t(COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX_KEY[countryCode]),
        })}
      </Text>

      <Row>
        {actionsMetadata.map((metadata, idx) => (
          <Row className={idx !== actionsMetadata.length - 1 ? 'mb-6' : ''} key={metadata.type}>
            <Column className="w-[24px] pr-4">
              <Img
                alt={t('imgAlt', {
                  actionType: metadata.type,
                })}
                height="24"
                src={buildTemplateInternalUrl(
                  metadata.hasCompleted
                    ? '/email/misc/checkedCircle.png'
                    : '/email/misc/uncheckedCircle.png',
                  hrefSearchParams,
                )}
                width="24"
              />
            </Column>
            <Column className="hidden h-[100px] w-[100px] rounded-xl bg-black md:table-cell">
              <Img
                alt={`${metadata.type} action icon`}
                className="m-auto"
                height="80"
                src={buildTemplateInternalUrl(metadata.image, hrefSearchParams)}
                width="80"
              />
            </Column>
            <Column className="px-4">
              <Heading align="start" as="h3" className="text-[#0A0B0D]" size="xs">
                {metadata.text}
              </Heading>
              <Text className="my-0 text-[#5B616E]">{metadata.subtext}</Text>
            </Column>
            <Column align="right" className="w-6 lg:w-[157px]">
              <Button
                className="hidden text-center lg:block"
                href={buildTemplateInternalUrl(metadata.buttonHref, hrefSearchParams)}
              >
                {metadata.buttonLabel}
              </Button>
              <Button
                className="block lg:hidden"
                href={buildTemplateInternalUrl(metadata.buttonHref, hrefSearchParams)}
                noPadding
                variant="ghost"
              >
                <ChevronRight />
              </Button>
            </Column>
          </Row>
        ))}
      </Row>
    </Section>
  )
}
