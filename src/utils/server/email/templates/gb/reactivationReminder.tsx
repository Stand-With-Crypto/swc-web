import * as React from 'react'
import { Img, Link, Section, Text } from '@react-email/components'

import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import { KeepUpTheFightSectionProps } from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { GBEmailTemplateProps } from '@/utils/server/email/templates/gb/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { GBWrapper } from './wrapper'

type ReactivationReminderProps = KeepUpTheFightSectionProps & GBEmailTemplateProps

const GBReactivationReminderEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  countryCode = SupportedCountryCodes.GB,
}: ReactivationReminderProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: GBReactivationReminderEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  return (
    <GBWrapper
      countryCode={countryCode}
      hrefSearchParams={hydratedHrefSearchParams}
      previewText={previewText}
    >
      <Section>
        <Img
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl('/gb/email/swc-join-still.png', hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Thanks for joining Stand With Crypto!</Heading>

        <Text className="mb-0 text-center text-[15px] text-[#5B616E]">
          We're excited that you've signed up to be a part of Stand With Crypto. SWC was created to
          galvanise the grassroots community, shine a spotlight on all the innovation taking place
          up and down the country, and to promote a positive business environment for crypto assets,
          blockchain technology and tokenisation, through policy change. The benefits of this
          technology for the UK economy:
          <br />
          <br />
        </Text>
        <ul className="pl-4 text-[15px] text-[#5B616E]">
          <li>Job creation</li>
          <li>Technological innovation</li>
          <li>Modernizing the financial system</li>
          <li>Protecting and empowering consumers</li>
          <li>Maintaining our competitive position as leading financial centre and fintech hub</li>
        </ul>
        <br />
        <Text className="my-0 text-center text-[15px] text-[#5B616E]">
          Stay tuned for more updates and information from SWC. You can always visit{' '}
          <Link
            className="text-[#5B616E]"
            href={buildTemplateInternalUrl('/gb', hydratedHrefSearchParams)}
          >
            our website
          </Link>{' '}
          to find the latest news and opportunities for advocacy, and follow us on our social media
          channels below. Thank you again for being a part of our community.
        </Text>
      </Section>
    </GBWrapper>
  )
}

GBReactivationReminderEmail.subjectLine = 'Connect with SWC'
GBReactivationReminderEmail.campaign = 'reactivation_reminder'

export default GBReactivationReminderEmail
