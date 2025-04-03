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

import { GBWrapper } from "./wrapper"

type RegisterToVoteReminderEmailProps = KeepUpTheFightSectionProps & GBEmailTemplateProps

const GBRegisterToVoteReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: RegisterToVoteReminderEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: GBRegisterToVoteReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <GBWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl(
            '/gb/email/voter-registration-banner.png',
            hydratedHrefSearchParams,
          )}
        />

        <Heading gutterBottom="md">
          Confirm your voter registration status and get a free NFT
        </Heading>

        <Text className="text-foreground-muted text-center text-base">
          Stand With Crypto is committed to mobilizing and activating the crypto community in the UK
          to make a difference in our country. One of the easiest and most effective ways to make a
          difference is simple: making sure you're registered to vote.
          <br />
          <br />
          Voters make the ultimate decision about who makes the rules that govern crypto, and who
          gets to decide crypto's legal future in the United Kingdom. And while it's critical to
          make your voice heard throughout the year, casting your ballot for candidates who believe
          in crypto will have perhaps the largest impact of any action you can take.
          <br />
          <br />
          Luckily, SWC makes it easy to register to vote. You can check your voter registration
          right here on SWC's website. After you do, make sure to encourage other members of the
          crypto community to do the same by posting on X and tagging us{' '}
          <Link className="text-inherit underline" href={GB_SOCIAL_MEDIA_URL.twitter}>
            @StandWithCrypto
          </Link>
          .
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/gb/action/voter-registration', hydratedHrefSearchParams)}
        >
          Make sure you're registered to vote
        </Button>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.GB}
        hiddenActions={['VOTER_REGISTRATION']}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </GBWrapper>
  )
}

GBRegisterToVoteReminderEmail.subjectLine = 'Register to vote and get a free NFT'
GBRegisterToVoteReminderEmail.campaign = 'register_to_vote_reminder'

export default GBRegisterToVoteReminderEmail
