import { Column, Img } from '@react-email/components'

import {
  FooterSection,
  HeaderSection,
  Wrapper,
  WrapperProps,
} from '@/utils/server/email/templates/common/ui/wrapper'
import { EU_SOCIAL_MEDIA_URL } from '@/utils/server/email/templates/eu/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import {
  getPhysicalMailingAddressByCountryCode,
  getSWCLegalEntityNameByCountryCode,
} from '@/utils/shared/legalUtils'

export function EUWrapper({
  children,
  hrefSearchParams = {},
  countryCode,
  ...props
}: React.PropsWithChildren<WrapperProps>) {
  return (
    <Wrapper {...props} countryCode={countryCode}>
      <HeaderSection>
        <Column>
          <HeaderSection.Logo href={buildTemplateInternalUrl('/eu', hrefSearchParams)}>
            <Img
              alt="Stand With Crypto"
              height="40"
              src={buildTemplateInternalUrl('/eu/email/misc/shield.svg', hrefSearchParams)}
              width="40"
            />
          </HeaderSection.Logo>
        </Column>
        <Column align="right" style={{ display: 'table-cell' }}>
          <HeaderSection.SocialMedia href={EU_SOCIAL_MEDIA_URL.twitter} text="Follow us on">
            <Img
              alt="X/Twitter logo"
              height="24"
              src={buildTemplateInternalUrl('/email/misc/xDotComLogo.png', hrefSearchParams)}
              width="24"
            />
          </HeaderSection.SocialMedia>
        </Column>
      </HeaderSection>

      {children}

      <FooterSection
        physicalMailingAddress={getPhysicalMailingAddressByCountryCode(countryCode)}
        privacyPolicyHref={buildTemplateInternalUrl('/eu/privacy', hrefSearchParams)}
        sendingEntity={getSWCLegalEntityNameByCountryCode(countryCode)}
        shieldSrc={buildTemplateInternalUrl('/eu/email/misc/shield.svg', hrefSearchParams)}
        swcHref={buildTemplateInternalUrl('/eu', hrefSearchParams)}
      >
        <FooterSection.SocialMedia
          alt="X/Twitter logo"
          href={EU_SOCIAL_MEDIA_URL.twitter}
          src={buildTemplateInternalUrl('/email/misc/xDotComLogo.png', hrefSearchParams)}
        />
        <FooterSection.SocialMedia
          alt="LinkedIn logo"
          href={EU_SOCIAL_MEDIA_URL.linkedin}
          src={buildTemplateInternalUrl('/email/misc/linkedinLogo.png', hrefSearchParams)}
        />
      </FooterSection>
    </Wrapper>
  )
}
