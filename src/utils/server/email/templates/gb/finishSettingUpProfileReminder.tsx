import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { GBEmailTemplateProps } from '@/utils/server/email/templates/gb/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { GBWrapper } from "./wrapper"

type FinishSettingUpProfileReminderEmailProps = KeepUpTheFightSectionProps & GBEmailTemplateProps

const GBFinishSettingUpProfileReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: FinishSettingUpProfileReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: GBFinishSettingUpProfileReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <GBWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/gb/email/swc-join-still.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Finish setting up your profile</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for signing up to be a Stand With Crypto UK advocate. As a reminder, please take
          just a few moments to finish setting up your full profile with SWC.
          <br />
          <br />
          Adding additional information will unlock special benefits with SWC, like exclusive
          communications, NFTs, and even more opportunities to engage with the pro-crypto movement
          we're building in the United Kingdom.
          <br />
          <br />
          Setting up your profile takes just a few minutes, and is easy to do on our site. Thank you
          so much for standing with crypto and being a part of this movement.
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/gb/profile', {
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
        countryCode={SupportedCountryCodes.GB}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </GBWrapper>
  )
}

GBFinishSettingUpProfileReminderEmail.subjectLine = 'Finish setting up your profile'
GBFinishSettingUpProfileReminderEmail.campaign = 'finish_setting_up_profile'

export default GBFinishSettingUpProfileReminderEmail
