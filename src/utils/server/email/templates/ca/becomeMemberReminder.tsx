import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { CAEmailTemplateProps } from '@/utils/server/email/templates/ca/constants'
import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/common/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type BecomeMemberReminderEmailProps = KeepUpTheFightSectionProps & CAEmailTemplateProps

const CABecomeMemberReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: BecomeMemberReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: CABecomeMemberReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <Wrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/ca/email/swc-join-still.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Level up your advocacy. Become a member</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for signing up to be a Stand With Crypto advocate. We're reaching out with an
          opportunity to take your advocacy to the next level by becoming a full member of Stand
          With Crypto Canada. Upgrading your membership is FREE and easy - just log onto our site
          below.
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
          <li>Policy analysis from top crypto strategists who are making an impact in Canada</li>
          <li>More chances to connect with fellow SWC members - particularly other full members</li>
          <li>
            Briefings from major crypto executives on how they see the political landscape and the
            future of crypto in Canada
          </li>
        </ul>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/ca/action/become-member', hydratedHrefSearchParams)}
        >
          Become a member
        </Button>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.CA}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </Wrapper>
  )
}

CABecomeMemberReminderEmail.subjectLine = 'Level up your advocacy. Become a 501(c)(4) member'
CABecomeMemberReminderEmail.campaign = 'become_member_reminder'

export default CABecomeMemberReminderEmail
