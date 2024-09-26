import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import {
  EmailEnabledActionNFTsNames,
  EmailTemplateProps,
  NFT_IMAGES_BY_ACTION,
} from '@/utils/server/email/templates/common/constants'
import { Heading } from '@/utils/server/email/templates/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/ui/keepUpTheFightSection'
import { Wrapper } from '@/utils/server/email/templates/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

type NFTOnTheWayEmailProps = KeepUpTheFightSectionProps &
  EmailTemplateProps & {
    actionNFT: EmailEnabledActionNFTsNames
  }

NFTOnTheWayEmail.subjectLine = 'Your NFT is on the way!'
NFTOnTheWayEmail.campaign = 'nft_on_the_way'

export default function NFTOnTheWayEmail({
  previewText,
  session = {},
  hrefSearchParams = {},
  // This default value is so react email dev server works properly
  // The required type ensures this is not called without it
  actionNFT = 'CALL',
  ...keepUpTheFightSectionProps
}: NFTOnTheWayEmailProps) {
  const hydratedHrefSearchParams = {
    utm_campaign: NFTOnTheWayEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  const nftImage = NFT_IMAGES_BY_ACTION[actionNFT]

  return (
    <Wrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          alt={nftImage.alt}
          className="mb-6 w-full max-w-full"
          src={buildTemplateInternalUrl(nftImage.src, hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Your NFT is on the way!</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for taking action with Stand With Crypto! Our movement will only succeed when
          members of our community are willing to step up and speak out on the importance of crypto
          to America's future.
          <br />
          <br />
          To celebrate your achievements, we're sending you a small token - an NFT you should see
          appearing in your wallet in the next few days.
          <br />
          <br />
          Don't let this be the end - please continue to check SWC's social media profiles, website,
          and your inbox for updates and future opportunities to engage.
        </Text>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </Wrapper>
  )
}
