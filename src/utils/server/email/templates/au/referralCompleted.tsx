import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { AUEmailTemplateProps } from '@/utils/server/email/templates/au/constants'
import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/common/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type AUReferralCompletedEmailProps = KeepUpTheFightSectionProps &
  AUEmailTemplateProps & {
    name: string | null
  }

AUReferralCompletedEmail.subjectLine = "You Did It! Now Let's Get More People Involved"
AUReferralCompletedEmail.campaign = 'referral_completed'

export default function AUReferralCompletedEmail({
  previewText = "One small step for you, one giant leap for crypto advocacy. Let's keep the momentum going!",
  session = {},
  hrefSearchParams = {},
  name,
  ...keepUpTheFightSectionProps
}: AUReferralCompletedEmailProps) {
  const hydratedHrefSearchParams = {
    utm_campaign: AUReferralCompletedEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  const referActionHref = buildTemplateInternalUrl('/action/refer', hydratedHrefSearchParams)

  return (
    <Wrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/email/swc-join-still.png', hydratedHrefSearchParams)}
        />
        <Heading gutterBottom="md">Your voice matters—now amplify it!</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Hey {name || 'Advocate'},
          <br />
          <br />
          You just completed your referral—nice work! 🚀 Now, let’s keep the momentum going. Every
          voice matters, and by bringing more people into the conversation, we can help shape the
          future of crypto, innovation, and beyond.
          <br />
          <br />
          Share your referral link and invite your friends to get involved. The more people
          participate, the stronger our impact!
          <br />
          <br />
          <Button fullWidth="mobile" href={referActionHref}>
            Share Your Link
          </Button>
          <br />
          <br />
          Let's stand together and make a difference
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
