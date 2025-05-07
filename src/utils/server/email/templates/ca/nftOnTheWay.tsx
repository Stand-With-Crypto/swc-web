import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import {
  CA_NFT_IMAGES_BY_ACTION,
  CAEmailTemplateProps,
} from '@/utils/server/email/templates/ca/constants'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { CAWrapper } from './wrapper'

type CANFTOnTheWayEmailProps = KeepUpTheFightSectionProps &
  CAEmailTemplateProps & {
    actionNFT: keyof typeof CA_NFT_IMAGES_BY_ACTION
  }

const CANFTOnTheWayEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  // This default value is so react email dev server works properly
  // The required type ensures this is not called without it
  actionNFT = 'OPT_IN',
  ...keepUpTheFightSectionProps
}: CANFTOnTheWayEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: CANFTOnTheWayEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  const nftImage = CA_NFT_IMAGES_BY_ACTION[actionNFT]

  return (
    <CAWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        {nftImage && (
          <Img
            alt={nftImage.alt}
            className="mb-6 w-full max-w-full"
            src={buildTemplateInternalUrl(nftImage.src, hydratedHrefSearchParams)}
          />
        )}

        <Heading gutterBottom="md">Your NFT is on the way!</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for taking action with Stand With Crypto! Our movement will only succeed when
          members of our community are willing to step up and speak out on the importance of crypto
          to Canada’s future.
          <br />
          <br />
          To celebrate your achievements, we’re sending you a small token – an NFT you should see
          appearing in your wallet in the next few days.
          <br />
          <br />
          Don’t let this be the end – please continue to check SWC’s social media profiles, website,
          and your inbox for updates and future opportunities to engage.
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

CANFTOnTheWayEmail.subjectLine = 'Your NFT is on the way!'
CANFTOnTheWayEmail.campaign = 'nft_on_the_way'

export default CANFTOnTheWayEmail
