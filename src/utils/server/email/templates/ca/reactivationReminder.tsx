import * as React from 'react'
import { Hr, Img, Link, Section, Text } from '@react-email/components'

import { CAEmailTemplateProps } from '@/utils/server/email/templates/ca/constants'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { CAWrapper } from './wrapper'

type ReactivationReminderProps = KeepUpTheFightSectionProps & CAEmailTemplateProps

const CAReactivationReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: ReactivationReminderProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: CAReactivationReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <CAWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/ca/email/swc-join-still.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Thanks for joining Stand With Crypto!</Heading>
        <Text className="mb-0 text-center text-[15px] text-[#5B616E]">
          We're excited that you've signed up to be a part of Stand With Crypto.
        </Text>
        <Text className="my-0 text-center text-[15px] text-[#5B616E]">
          Stay tuned for more updates and information from SWC. You can always visit{' '}
          <Link
            className="text-[#5B616E]"
            href={buildTemplateInternalUrl('/ca', hydratedHrefSearchParams)}
          >
            our website
          </Link>{' '}
          to find the latest news and opportunities for advocacy, and follow us on our social media
          channels below. Thank you again for being a part of our community.
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

CAReactivationReminderEmail.subjectLine = 'Connect with SWC'
CAReactivationReminderEmail.campaign = 'reactivation_reminder'

export default CAReactivationReminderEmail
