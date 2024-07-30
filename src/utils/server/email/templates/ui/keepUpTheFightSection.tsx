import * as React from 'react'
import { Column, Img, Row, Section, Text } from '@react-email/components'
import { ChevronRight } from 'lucide-react'

import {
  ACTIONS_METADATA_BY_TYPE,
  EmailActiveActions,
} from '@/utils/server/email/templates/common/constants'
import { Button } from '@/utils/server/email/templates/ui/button'
import { Heading } from '@/utils/server/email/templates/ui/heading'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

export interface KeepUpTheFightSectionProps {
  completedActionTypes?: EmailActiveActions[]
  hrefSearchParams?: Record<string, unknown>
  hiddenActions?: string[]
}

export function KeepUpTheFightSection({
  completedActionTypes = [],
  hrefSearchParams = {},
  hiddenActions = [],
}: KeepUpTheFightSectionProps) {
  const actionsMetadata = Object.entries(ACTIONS_METADATA_BY_TYPE)
    .filter(([type]) => !hiddenActions.includes(type))
    .map(([type, metadata]) => ({
      ...metadata,
      hasCompleted: completedActionTypes.includes(type),
      type,
    }))
    .sort((a, b) => Number(a.hasCompleted) - Number(b.hasCompleted))

  return (
    <Section>
      <Heading as="h2" gutterBottom="md" size="md">
        Keep up the fight
      </Heading>
      <Text className="text-foreground-muted text-center text-base">
        Don't wait - take action now. See below for actions you can take to help keep crypto in
        America.
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
            <Column className="hidden w-[100px] pr-4 md:table-cell">
              <Img
                alt={`${metadata.type} action icon`}
                className="rounded-xl bg-black"
                height="100"
                src={buildTemplateInternalUrl(metadata.image, hrefSearchParams)}
                width="100"
              />
            </Column>
            <Column className="pr-4">
              <Heading align="start" as="h3" size="sm">
                {metadata.text}
              </Heading>
              <Text className="text-foreground-muted my-0">{metadata.subtext}</Text>
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
