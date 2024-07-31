import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { EmailTemplateProps } from '@/utils/server/email/templates/common/constants'
import { Button } from '@/utils/server/email/templates/ui/button'
import { Heading } from '@/utils/server/email/templates/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

type ContactYourRepresentativeReminderEmailProps = KeepUpTheFightSectionProps & EmailTemplateProps

ContactYourRepresentativeReminderEmail.subjectLine = 'Make your voice heard'

export default function ContactYourRepresentativeReminderEmail({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: ContactYourRepresentativeReminderEmailProps) {
  const hydratedHrefSearchParams = {
    utm_campaign: 'contact_your_representative_reminder',
    ...hrefSearchParams,
    ...session,
  }

  return (
    <Wrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/email/contact-rep-banner.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Make your voice heard</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Stand With Crypto was founded to give the crypto community a voice in major policy
          debates. As policymakers in DC discuss the future of crypto in America, they need to hear
          from you!
          <br />
          <br />
          Luckily, SWC makes it easy to get active. We have simple and easy tools that allow you to
          email your member of Congress or call their office and let them know that you care about
          crypto. All you need to do is enter your address and we’ll make sure your email or call is
          routed correctly.
        </Text>
      </Section>

      <Section className="mt-4 space-x-4 space-y-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/action/call', hydratedHrefSearchParams)}
          variant="secondary"
        >
          Make a call
        </Button>
        <Button
          className="ml-0 mt-4 md:ml-4 md:mt-0"
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/action/email', hydratedHrefSearchParams)}
        >
          Send an email
        </Button>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        hiddenActions={['EMAIL', 'CALL']}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </Wrapper>
  )
}
