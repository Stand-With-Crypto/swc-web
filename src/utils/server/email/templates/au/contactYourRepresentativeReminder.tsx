import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { AUEmailTemplateProps } from '@/utils/server/email/templates/au/constants'
import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { AUWrapper } from './wrapper'

type ContactYourRepresentativeReminderEmailProps = KeepUpTheFightSectionProps & AUEmailTemplateProps

const AUContactYourRepresentativeReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: ContactYourRepresentativeReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: AUContactYourRepresentativeReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <AUWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl(
            '/au/email/contact-rep-banner.png',
            hydratedHrefSearchParams,
          )}
        />

        <Heading gutterBottom="md">Make your voice heard</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Stand With Crypto was founded to give the crypto community a voice in major policy
          debates. As policymakers in Canberra discuss the future of crypto in Australia, they need
          to hear from you!
          <br />
          <br />
          Email your member of House of Representatives or call their office and let them know that
          you care about crypto.
        </Text>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.AU}
        hiddenActions={['EMAIL', 'CALL']}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </AUWrapper>
  )
}

AUContactYourRepresentativeReminderEmail.subjectLine = 'Make your voice heard'
AUContactYourRepresentativeReminderEmail.campaign = 'contact_your_representative_reminder'

export default AUContactYourRepresentativeReminderEmail
