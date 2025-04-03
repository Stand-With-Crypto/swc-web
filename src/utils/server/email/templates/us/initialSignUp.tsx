import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { USEmailTemplateProps } from '@/utils/server/email/templates/us/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { USWrapper } from "./wrapper"

type InitialSignUpEmailProps = KeepUpTheFightSectionProps & USEmailTemplateProps

const USInitialSignUpEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: InitialSignUpEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: USInitialSignUpEmail.campaign,
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
        countryCode={SupportedCountryCodes.US}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </USWrapper>
  )
}

USInitialSignUpEmail.subjectLine = 'Thanks for joining SWC!'
USInitialSignUpEmail.campaign = 'initial_signup'

export default USInitialSignUpEmail
