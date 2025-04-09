import * as React from 'react'
import { Hr, Img, Link, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import {
  GB_SOCIAL_MEDIA_URL,
  GBEmailTemplateProps,
} from '@/utils/server/email/templates/gb/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { GBWrapper } from './wrapper'

type FollowOnXReminderEmailProps = KeepUpTheFightSectionProps & GBEmailTemplateProps

const GBFollowOnXReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: FollowOnXReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: GBFollowOnXReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <GBWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/gb/email/x-banner.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Stay up to date on crypto policy</Heading>

        <Text className="text-foreground-muted text-center text-base">
          We're so grateful for our Stand With Crypto community members, and we want to make sure
          you stay connected to everything we're doing. While we strive to keep you up to date here
          in your inbox, another great way to get the latest news is to{' '}
          <Link className="text-inherit underline" href={GB_SOCIAL_MEDIA_URL.twitter}>
            follow us on X
          </Link>
          .
          <br />
          <br />
          X is where you'll get instant updates on events we're hosting, news we're reading, and
          awesome discussion Spaces that we host with advocates and founders across the country.
          <br />
          <br />
          <Link className="text-inherit underline" href={GB_SOCIAL_MEDIA_URL.twitter}>
            Follow us on X
          </Link>
          . and you'll get it all into your feed as it comes. We can't wait to see you there!
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button fullWidth="mobile" href={GB_SOCIAL_MEDIA_URL.twitter}>
          Follow us on X
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

GBFollowOnXReminderEmail.subjectLine = 'Stay up to date on crypto policy in the UK'
GBFollowOnXReminderEmail.campaign = 'follow_on_x_reminder'

export default GBFollowOnXReminderEmail
