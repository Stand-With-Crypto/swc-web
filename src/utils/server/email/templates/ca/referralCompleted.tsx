import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { CAEmailTemplateProps } from '@/utils/server/email/templates/ca/constants'
import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { CAWrapper } from './wrapper'

type CAReferralCompletedEmailProps = KeepUpTheFightSectionProps &
  CAEmailTemplateProps & {
    name: string | null
  }

CAReferralCompletedEmail.subjectLine = "You Did It! Now Let's Get More People Involved"
CAReferralCompletedEmail.campaign = 'referral_completed'

export default function CAReferralCompletedEmail({
  previewText = "One small step for you, one giant leap for crypto advocacy. Let's keep the momentum going!",
  session = {},
  hrefSearchParams = {},
  name,
  ...keepUpTheFightSectionProps
}: CAReferralCompletedEmailProps) {
  const hydratedHrefSearchParams = {
    utm_campaign: CAReferralCompletedEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  const referActionHref = buildTemplateInternalUrl('/ca/action/refer', hydratedHrefSearchParams)

  return (
    <CAWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/ca/email/swc-join-still.png', hydratedHrefSearchParams)}
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
        countryCode={SupportedCountryCodes.CA}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </CAWrapper>
  )
}
