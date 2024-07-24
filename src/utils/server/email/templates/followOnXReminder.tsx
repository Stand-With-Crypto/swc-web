import * as React from 'react'
import { Hr, Img, Link, Section, Text } from '@react-email/components'

import {
  EmailTemplateProps,
  SOCIAL_MEDIA_URL,
} from '@/utils/server/email/templates/common/constants'
import { Button } from '@/utils/server/email/templates/ui/button'
import { Heading } from '@/utils/server/email/templates/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

type FollowOnXReminderEmailProps = KeepUpTheFightSectionProps & EmailTemplateProps

FollowOnXReminderEmail.subjectLine = 'Stay up to date on crypto policy'

export default function FollowOnXReminderEmail({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: FollowOnXReminderEmailProps) {
  const hydratedHrefSearchParams = {
    utm_campaign: 'follow_on_x_reminder',
    ...hrefSearchParams,
    ...session,
  }

  return (
    <Wrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 max-w-full"
          src={buildTemplateInternalUrl('/email/x-banner.png', hydratedHrefSearchParams)}
          width={620}
        />

        <Heading gutterBottom="md">Stay up to date on crypto policy</Heading>

        <Text className="text-foreground-muted text-center text-base">
          We're so grateful for our Stand With Crypto community members, and we want to make sure
          you stay connected to everything we're doing. While we strive to keep you up to date here
          in your inbox, another great way to get the latest news is to{' '}
          <Link className="text-inherit underline" href={SOCIAL_MEDIA_URL.twitter}>
            follow us on X
          </Link>
          .
          <br />
          <br />
          X is where you'll get instant updates on events we're hosting, news we're reading, and
          awesome discussion Spaces that we host with advocates and founders across the country.
          <br />
          <br />
          <Link className="text-inherit underline" href={SOCIAL_MEDIA_URL.twitter}>
            Follow us on X
          </Link>
          . and you'll get it all into your feed as it comes. We can't wait to see you there!
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button fullWidth="mobile" href={SOCIAL_MEDIA_URL.twitter}>
          Follow us on X
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
