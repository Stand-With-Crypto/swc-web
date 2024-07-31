import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { EmailTemplateProps } from '@/utils/server/email/templates/common/constants'
import { Button } from '@/utils/server/email/templates/ui/button'
import { Heading } from '@/utils/server/email/templates/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

type FinishSettingUpProfileReminderEmailProps = KeepUpTheFightSectionProps & EmailTemplateProps

FinishSettingUpProfileReminderEmail.subjectLine = 'Finish setting up your profile'

export default function FinishSettingUpProfileReminderEmail({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: FinishSettingUpProfileReminderEmailProps) {
  const hydratedHrefSearchParams = {
    utm_campaign: 'finish_setting_up_profile',
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

        <Heading gutterBottom="md">Finish setting up your profile</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for signing up to be a Stand With Crypto advocate. As a reminder, please take
          just a few moments to finish setting up your full profile with SWC.
          <br />
          <br />
          Adding additional information will unlock special benefits with SWC, like exclusive
          communications, NFTs, and even more opportunities to engage with the pro-crypto movement
          we're building.
          <br />
          <br />
          Setting up your profile takes just a few minutes, and is easy to do on our site. Thank you
          so much for standing with crypto and being a part of this movement.
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/profile', {
            hasOpenUpdateUserProfileForm: true,
            ...hydratedHrefSearchParams,
          })}
        >
          Finish your profile
        </Button>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </Wrapper>
  )
}
