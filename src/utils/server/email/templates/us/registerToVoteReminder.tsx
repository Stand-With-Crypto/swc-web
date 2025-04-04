import * as React from 'react'
import { Hr, Img, Link, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import {
  US_SOCIAL_MEDIA_URL,
  USEmailTemplateProps,
} from '@/utils/server/email/templates/us/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { USWrapper } from './wrapper'

type RegisterToVoteReminderEmailProps = KeepUpTheFightSectionProps & USEmailTemplateProps

const USRegisterToVoteReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: RegisterToVoteReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: USRegisterToVoteReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <USWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl(
            '/email/voter-registration-banner.png',
            hydratedHrefSearchParams,
          )}
        />

        <Heading gutterBottom="md">
          Confirm your voter registration status and get a free NFT
        </Heading>

        <Text className="text-foreground-muted text-center text-base">
          Stand With Crypto is committed to mobilizing and activating the crypto community in
          America to make a difference in our country. One of the easiest and most effective ways to
          make a difference is simple: making sure you're registered to vote.
          <br />
          <br />
          Voters make the ultimate decision about who makes the rules that govern crypto, and who
          gets to decide crypto's legal future in the United States. And while it's critical to make
          your voice heard throughout the year, casting your ballot for candidates who believe in
          crypto will have perhaps the largest impact of any action you can take.
          <br />
          <br />
          Luckily, SWC makes it easy to register to vote. You can check your voter registration
          right here on SWC's website. After you do, make sure to encourage other members of the
          crypto community to do the same by posting on X and tagging us{' '}
          <Link className="text-inherit underline" href={US_SOCIAL_MEDIA_URL.twitter}>
            @StandWithCrypto
          </Link>
          .
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/action/voter-registration', hydratedHrefSearchParams)}
        >
          Make sure you're registered to vote
        </Button>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.US}
        hiddenActions={['VOTER_REGISTRATION']}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </USWrapper>
  )
}

USRegisterToVoteReminderEmail.subjectLine = 'Register to vote and get a free NFT'
USRegisterToVoteReminderEmail.campaign = 'register_to_vote_reminder'

export default USRegisterToVoteReminderEmail
