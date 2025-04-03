import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { GBEmailTemplateProps } from '@/utils/server/email/templates/gb/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { GBWrapper } from "./wrapper"

type BecomeMemberReminderEmailProps = KeepUpTheFightSectionProps & GBEmailTemplateProps

const GBBecomeMemberReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: BecomeMemberReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: GBBecomeMemberReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <GBWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/gb/email/swc-join-still.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Level up your advocacy. Become a member</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for signing up to be a Stand With Crypto advocate. We're reaching out with an
          opportunity to take your advocacy to the next level by becoming a full member of Stand
          With Crypto UK. Upgrading your membership is FREE and easy - just log onto our site below.
          <br />
          <br />
          Becoming a full member changes what SWC is allowed to communicate with you about, and
          you'll have access to benefits like:
          <br />
        </Text>
      </Section>

      <Section>
        <ul className="text-foreground-muted pl-4">
          <li>
            Exclusive political communications about key legislative initiatives we're tracking
          </li>
          <li>Policy analysis from top crypto strategists who are making an impact in the UK</li>
          <li>More chances to connect with fellow SWC members - particularly other full members</li>
          <li>
            Briefings from major crypto executives on how they see the political landscape and the
            future of crypto in the United Kingdom
          </li>
        </ul>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/gb/action/become-member', hydratedHrefSearchParams)}
        >
          Become a member
        </Button>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.GB}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </GBWrapper>
  )
}

GBBecomeMemberReminderEmail.subjectLine = 'Level up your advocacy. Become a 501(c)(4) member'
GBBecomeMemberReminderEmail.campaign = 'become_member_reminder'

export default GBBecomeMemberReminderEmail
