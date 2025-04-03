import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { USEmailTemplateProps } from '@/utils/server/email/templates/us/constants'
import { USWrapper } from '@/utils/server/email/templates/us/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type BecomeMemberReminderEmailProps = KeepUpTheFightSectionProps & USEmailTemplateProps

const USBecomeMemberReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: BecomeMemberReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: USBecomeMemberReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <USWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/email/swc-join-still.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Level up your advocacy. Become a 501(c)(4) member</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for signing up to be a Stand With Crypto advocate. We're reaching out with an
          opportunity to take your advocacy to the next level by becoming a full 501(c)4 member of
          Stand With Crypto. Upgrading your membership is FREE and easy - just log onto our site
          below.
          <br />
          <br />
          Becoming a full 501(c)4 member changes what SWC is allowed to communicate with you about,
          and you'll have access to benefits like:
          <br />
        </Text>
      </Section>

      <Section>
        <ul className="text-foreground-muted pl-4">
          <li>
            Exclusive political communications about key elections and candidates we're tracking
          </li>
          <li>
            Election analysis from top crypto political strategists who are making big moves leading
            into November
          </li>
          <li>More chances to connect with fellow SWC members - particularly other full members</li>
          <li>
            Briefings from major crypto executives on how they see the political landscape and the
            future of crypto in America
          </li>
        </ul>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/action/become-member', hydratedHrefSearchParams)}
        >
          Become a member
        </Button>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.US}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </USWrapper>
  )
}

USBecomeMemberReminderEmail.subjectLine = 'Level up your advocacy. Become a 501(c)(4) member'
USBecomeMemberReminderEmail.campaign = 'become_member_reminder'

export default USBecomeMemberReminderEmail
