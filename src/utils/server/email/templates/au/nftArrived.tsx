import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import {
  AU_NFT_IMAGES_BY_ACTION,
  AUEmailTemplateProps,
} from '@/utils/server/email/templates/au/constants'
import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { AUWrapper } from './wrapper'

type AUNFTArrivedEmailProps = KeepUpTheFightSectionProps &
  AUEmailTemplateProps & {
    actionNFT: keyof typeof AU_NFT_IMAGES_BY_ACTION
  }

const AUNFTArrivedEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  // This default value is so react email dev server works properly
  // The required type ensures this is not called without it
  actionNFT = 'CALL',
  ...keepUpTheFightSectionProps
}: AUNFTArrivedEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: AUNFTArrivedEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  const nftImage = AU_NFT_IMAGES_BY_ACTION[actionNFT]

  return (
    <AUWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        {nftImage && (
          <Img
            alt={nftImage.alt}
            className="mb-6 w-full max-w-full overflow-hidden rounded-3xl"
            src={buildTemplateInternalUrl(nftImage.src, hydratedHrefSearchParams)}
          />
        )}

        <Heading gutterBottom="md">Your NFT has arrived!</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for taking action with Stand With Crypto! Our movement will only succeed when
          members of our community are willing to step up and speak out on the importance of crypto
          to Australia’s future.
          <br />
          <br />
          To celebrate your achievements, we’ve sent you a small token – an NFT you should see
          appearing on your profile soon.
          <br />
          <br />
          Don’t let this be the end – please continue to check SWC’s social media profiles, website,
          and your inbox for updates and future opportunities to engage.
        </Text>
      </Section>

      <Section className="mt-4 text-center">
        <Button
          fullWidth="mobile"
          href={buildTemplateInternalUrl('/profile#nfts', hydratedHrefSearchParams)}
        >
          View NFT
        </Button>
      </Section>

      <Hr className="my-8" />

      <KeepUpTheFightSection
        {...keepUpTheFightSectionProps}
        countryCode={SupportedCountryCodes.AU}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </AUWrapper>
  )
}

AUNFTArrivedEmail.subjectLine = 'Your NFT has arrived!'
AUNFTArrivedEmail.campaign = 'nft_arrived'

export default AUNFTArrivedEmail
