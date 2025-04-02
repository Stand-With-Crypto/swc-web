import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { AUEmailTemplateProps } from '@/utils/server/email/templates/au/constants'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/common/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type InitialSignUpEmailProps = KeepUpTheFightSectionProps & AUEmailTemplateProps

const AUInitialSignUpEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: InitialSignUpEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: AUInitialSignUpEmail.campaign,
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

        <Heading gutterBottom="md">Thanks for joining Stand With Crypto Australia!</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for signing up to be a Stand With Crypto advocate. Crypto advocates like you are
          making a huge difference in Australia, from your local community to Parliament.
          <br />
          <br />
          Stand With Crypto advocates have brought crypto to the forefront of political discussions,
          and helped highlight the real-world uses of crypto that make a difference in Australians'
          everyday lives.
          <br />
          <br />
          Keep an eye out for more communications from us: you'll see updates on key news stories
          we're tracking, events in your local area, and opportunities for you to raise your voice
          to your elected officials.
          <br />
          <br />
          Together, we're making a difference for crypto in Australia. Thank you for standing with
          us.
        </Text>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.AU}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </Wrapper>
  )
}

AUInitialSignUpEmail.subjectLine = 'Thanks for joining SWC!'
AUInitialSignUpEmail.campaign = 'initial_signup'

export default AUInitialSignUpEmail
