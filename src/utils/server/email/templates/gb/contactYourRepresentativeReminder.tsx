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
  ...keepUpTheFightSectionProps
}: ContactYourRepresentativeReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: GBContactYourRepresentativeReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <GBWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
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
          Email your representative or call their office and let them know that you care about
          crypto.
        </Text>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.GB}
        hiddenActions={['EMAIL', 'CALL']}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </GBWrapper>
  )
}

GBContactYourRepresentativeReminderEmail.subjectLine = 'Make your voice heard'
GBContactYourRepresentativeReminderEmail.campaign = 'contact_your_representative_reminder'

export default GBContactYourRepresentativeReminderEmail
