import * as React from 'react'
import { Hr, Img, Link, Section, Text } from '@react-email/components'

import { AUEmailTemplateProps } from '@/utils/server/email/templates/au/constants'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/common/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

type ReactivationReminderProps = KeepUpTheFightSectionProps & AUEmailTemplateProps

const AUReactivationReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  ...keepUpTheFightSectionProps
}: ReactivationReminderProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: AUReactivationReminderEmail.campaign,
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

        <Heading gutterBottom="md">Thanks for joining Stand With Crypto Australia!</Heading>

        <Text className="mb-0 text-center text-[15px] text-[#5B616E]">
          We're excited that you've signed up to be a part of Stand With Crypto. SWC was created to
          give the Australian crypto community a voice in the public debates around crypto and to
          educate lawmakers and the public about the benefits of keeping crypto in Australia,
          including:
          <br />
          <br />
        </Text>
        <ul className="pl-4 text-[15px] text-[#5B616E]">
          <li>Job creation</li>
          <li>Technology and innovation</li>
          <li>Modernizing the financial system</li>
          <li>Protecting and empowering consumers</li>
          <li>Maintaining Australia's competitive edge</li>
        </ul>
        <br />
        <Text className="my-0 text-center text-[15px] text-[#5B616E]">
          Stay tuned for more updates and information from SWC. You can always visit{' '}
          <Link
            className="text-[#5B616E]"
            href={buildTemplateInternalUrl('/', hydratedHrefSearchParams)}
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
        countryCode={SupportedCountryCodes.AU}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </Wrapper>
  )
}

AUReactivationReminderEmail.subjectLine = 'Connect with SWC'
AUReactivationReminderEmail.campaign = 'reactivation_reminder'

export default AUReactivationReminderEmail
