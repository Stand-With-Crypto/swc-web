import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { GBEmailTemplateProps } from '@/utils/server/email/templates/gb/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { GBWrapper } from './wrapper'

type ContactYourRepresentativeReminderEmailProps = KeepUpTheFightSectionProps & GBEmailTemplateProps

const GBContactYourRepresentativeReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  countryCode = SupportedCountryCodes.GB,
  ...keepUpTheFightSectionProps
}: ContactYourRepresentativeReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: GBContactYourRepresentativeReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <GBWrapper
      countryCode={countryCode}
      hrefSearchParams={hydratedHrefSearchParams}
      previewText={previewText}
    >
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl(
            '/gb/email/contact-rep-banner.png',
            hydratedHrefSearchParams,
          )}
        />

        <Heading gutterBottom="md">Make your voice heard</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Stand With Crypto was founded to give the crypto community a voice in major policy
          debates. As policymakers in Westminster discuss the future of crypto in the UK, they need
          to hear from you!
          <br />
          <br />
          Luckily, SWC makes it easy to get active. We have simple and easy tools that allow you to
          email your MP or call their office and let them know that you care about crypto. All you
          need to do is enter your address and we’ll make sure your email or call is routed
          correctly
        </Text>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={countryCode}
        hiddenActions={['EMAIL', 'CALL']}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </GBWrapper>
  )
}

GBContactYourRepresentativeReminderEmail.subjectLine = 'Make your voice heard'
GBContactYourRepresentativeReminderEmail.campaign = 'contact_your_representative_reminder'

export default GBContactYourRepresentativeReminderEmail
