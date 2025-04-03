import * as React from 'react'
import { Hr, Img, Section, Text } from '@react-email/components'

import { Button } from '@/utils/server/email/templates/common/ui/button'
import { Heading } from '@/utils/server/email/templates/common/ui/heading'
import {
  KeepUpTheFightSection,
  KeepUpTheFightSectionProps,
} from '@/utils/server/email/templates/common/ui/keepUpTheFightSection'
import {
  US_NFT_IMAGES_BY_ACTION,
  USEmailTemplateProps,
} from '@/utils/server/email/templates/us/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { USWrapper } from "./wrapper"

type USNFTArrivedEmailProps = KeepUpTheFightSectionProps &
  USEmailTemplateProps & {
    actionNFT: keyof typeof US_NFT_IMAGES_BY_ACTION
  }

const USNFTArrivedEmail = ({
  previewText,
  session = {},
  hrefSearchParams = {},
  // This default value is so react email dev server works properly
  // The required type ensures this is not called without it
  actionNFT = 'CALL',
  ...keepUpTheFightSectionProps
}: USNFTArrivedEmailProps) => {
  const hydratedHrefSearchParams = {
    utm_campaign: USNFTArrivedEmail.campaign,
    ...hrefSearchParams,
    ...session,
  }

  const nftImage = US_NFT_IMAGES_BY_ACTION[actionNFT]

  return (
    <USWrapper hrefSearchParams={hydratedHrefSearchParams} previewText={previewText}>
      <Section>
        <Img
          alt={nftImage.alt}
          className="mb-6 w-full max-w-full overflow-hidden rounded-3xl"
          src={buildTemplateInternalUrl(nftImage.src, hydratedHrefSearchParams)}
        />

        <Heading gutterBottom="md">Your NFT has arrived!</Heading>

        <Text className="text-foreground-muted text-center text-base">
          Thank you for taking action with Stand With Crypto! Our movement will only succeed when
          members of our community are willing to step up and speak out on the importance of crypto
          to America's future.
          <br />
          <br />
          To celebrate your achievements, we've sent you a small token - an NFT you should see
          appearing on your profile soon.
          <br />
          <br />
          Don't let this be the end - please continue to check SWC's social media profiles, website,
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
        countryCode={SupportedCountryCodes.US}
        hrefSearchParams={hydratedHrefSearchParams}
      />
    </USWrapper>
  )
}

USNFTArrivedEmail.subjectLine = 'Your NFT has arrived!'
USNFTArrivedEmail.campaign = 'nft_arrived'

export default USNFTArrivedEmail
