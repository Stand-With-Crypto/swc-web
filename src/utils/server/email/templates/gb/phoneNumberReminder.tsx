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

import { GBWrapper } from './wrapper'

type PhoneNumberReminderEmailProps = KeepUpTheFightSectionProps & GBEmailTemplateProps

const GBPhoneNumberReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: PhoneNumberReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: GBPhoneNumberReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <GBWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/gb/email/phone-banner.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">
          Get text updates on crypto policy and invites to UK events
        </Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for signing up to be a Stand With Crypto advocate in the UK. We're reaching out
          to encourage you to take your advocacy to the next level by adding a phone number to
          receive text messages from SWC.
          <br />
          <br />
          You'll receive updates on key crypto bills, exclusive events in the United Kingdom, and
          opportunities for advocacy. We promise to only reach out when it's important.
          <br />
          <br />
          SWC will never use your phone number for commercial purposes, and we have a robust{' '}
          <Button
            color="primary-cta"
            href={buildTemplateInternalUrl('/gb/privacy', hydratedHrefSearchParams)}
            noPadding
            variant="link"
          >
            privacy policy
          </Button>{' '}
          that outlines the ways we use any information you provide us.
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
          Get text updates
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

GBPhoneNumberReminderEmail.subjectLine = 'Get text updates from SWC UK'
GBPhoneNumberReminderEmail.campaign = 'phone_number_reminder'

export default GBPhoneNumberReminderEmail
