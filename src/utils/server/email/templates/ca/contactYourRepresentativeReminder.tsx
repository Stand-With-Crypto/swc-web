import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { CAEmailTemplateProps } from '@/utils/server/email/templates/ca/constants'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { CAWrapper } from './wrapper'

type ContactYourRepresentativeReminderEmailProps = KeepUpTheFightSectionProps & CAEmailTemplateProps

const CAContactYourRepresentativeReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: ContactYourRepresentativeReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: CAContactYourRepresentativeReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <CAWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl(
            '/ca/email/contact-rep-banner.png',
            hydratedHrefSearchParams,
          )}
        />

        <Heading gutterBottom="md">Make your voice heard</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Stand With Crypto was founded to give the crypto community a voice in major policy
          debates. As policymakers in Ottawa discuss the future of crypto in Canada, they need to
          hear from you!
          <br />
          <br />
          Email your member of Parliament or call their office and let them know that you care about
          crypto.
        </Text>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.CA}
        hiddenActions={['EMAIL', 'CALL']}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </CAWrapper>
  )
}

CAContactYourRepresentativeReminderEmail.subjectLine = 'Make your voice heard'
CAContactYourRepresentativeReminderEmail.campaign = 'contact_your_representative_reminder'

export default CAContactYourRepresentativeReminderEmail
