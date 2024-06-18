import * as React from 'react'
import { Column, Hr, Img, Row, Section, Text } from '@react-email/components'
import { ChevronRight } from 'lucide-react'

import {
  ACTIONS_METADATA_BY_TYPE,
  BASE_URL,
  EmailActiveActions,
} from '@/lib/email/templates/common/constants'
import { Button } from '@/lib/email/templates/ui/button'
import { Heading } from '@/lib/email/templates/ui/heading'
import { Wrapper } from '@/lib/email/templates/ui/wrapper'

interface InitialSignUpEmailProps {
  completedActionTypes?: EmailActiveActions[]
}

export default function InitialSignUpEmail({ completedActionTypes = [] }: InitialSignUpEmailProps) {
  const actionsMetadata = Object.entries(ACTIONS_METADATA_BY_TYPE)
    .map(([type, metadata]) => ({
      ...metadata,
      hasCompleted: completedActionTypes.includes(type),
      type,
    }))
    .sort((a, b) => Number(a.hasCompleted) - Number(b.hasCompleted))

  return (
    <Wrapper previewText="This is a hello world example">
      <Section>
        <Img className="mb-6 max-w-full" src={`${BASE_URL}/email/swc-join-still.png`} width={620} />

        <Heading gutterBottom="md">Thanks for joining!</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for signing up to be a Stand With Crypto advocate. Crypto advocates like you are
          making a huge difference in America, from your local community to Capitol Hill.
          <br />
          <br />
          Stand With Crypto advocates have moved votes in Congress, brought crypto to the forefront
          of political campaigns, and helped highlight the real-world uses of crypto that make a
          difference in Americans' everyday lives.
          <br />
          <br />
          Keep an eye out for more communications from us: you'll see updates on key news stories
          we're tracking, events in your local area, and opportunities for you to raise your voice
          to your elected officials.
          <br />
          <br />
          Together, we're making a difference for crypto. Thank you for standing with us.
        </Text>
      </Section>

      <Hr className="my-8" />

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
                  src={
                    metadata.hasCompleted
                      ? `${BASE_URL}/email/misc/checkedCircle.png`
                      : `${BASE_URL}/email/misc/uncheckedCircle.png`
                  }
                  width="24"
                />
              </Column>
              <Column className="hidden w-[100px] pr-4 md:table-cell">
                <Img
                  alt={`${metadata.type} action icon`}
                  className="rounded-xl"
                  height="100"
                  src={metadata.image}
                  width="100"
                />
              </Column>
              <Column className="pr-4">
                <Heading align="start" as="h3" size="sm">
                  {metadata.text}
                </Heading>
                <Text className="text-foreground-muted my-0">{metadata.text}</Text>
              </Column>
              <Column align="right" className="w-6 md:w-[157px]">
                <Button className="hidden text-center md:block" href={metadata.buttonHref}>
                  {metadata.buttonLabel}
                </Button>
                <Button
                  className="block md:hidden"
                  href={metadata.buttonHref}
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
    </Wrapper>
  )
}
