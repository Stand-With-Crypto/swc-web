import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { EmailTemplateProps } from '@/utils/server/email/templates/common/constants'
import { Heading } from '@/utils/server/email/templates/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

type InitialSignUpEmailProps = KeepUpTheFightSectionProps & EmailTemplateProps

InitialSignUpEmail.subjectLine = 'Thanks for joining SWC!'
InitialSignUpEmail.campaign = 'initial_signup'

export default function InitialSignUpEmail({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: InitialSignUpEmailProps) {
  const hydratedHrefSearchParams = {
    utm_campaign: InitialSignUpEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <Wrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/email/swc-join-still.png', hydratedHrefSearchParams)}
        />

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

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </Wrapper>
  )
}
