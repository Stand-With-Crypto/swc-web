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
import { COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX } from '@/utils/shared/intl/displayNames'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

function getCountryCTA(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return 'Keep up the fight'
    case SupportedCountryCodes.AU:
      return 'Join the Movement'
    case SupportedCountryCodes.CA:
      return 'Join the Movement'
    case SupportedCountryCodes.GB:
      return 'Join the Movement'
    default:
      return 'Keep up the fight'
  }
}

export interface KeepUpTheFightSectionProps {
  completedActionTypes?: EmailActiveActions[]
  hrefSearchParams?: Record<string, unknown>
  hiddenActions?: string[]
  countryCode: SupportedCountryCodes
  ctaText?: string
}

export function KeepUpTheFightSection({
  completedActionTypes = [],
  hrefSearchParams = {},
  hiddenActions = [],
  countryCode,
  ctaText = getCountryCTA(countryCode),
}: KeepUpTheFightSectionProps) {
  const actionsMetadata = Object.entries(getEmailActionsMetadataByCountry(countryCode))
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
        Don't wait - take action now. See below for actions you can take to help keep crypto in{' '}
        {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}.
      </Text>

      <Row>
        {actionsMetadata.map((metadata, idx) => (
          <Row className={idx !== actionsMetadata.length - 1 ? 'mb-6' : ''} key={metadata.type}>
            <Column className="w-[24px] pr-4">
              <Img
                alt={`${metadata.type} action icon`}
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
