import { Column, Img } from '@react-email/components'

import { CA_SOCIAL_MEDIA_URL } from '@/utils/server/email/templates/ca/constants'
import {
  FooterSection,
  HeaderSection,
  Wrapper,
  WrapperProps,
} from '@/utils/server/email/templates/common/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import {
  getPhysicalMailingAddressByCountryCode,
  getSWCLegalEntityNameByCountryCode,
} from '@/utils/shared/legalUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export function CAWrapper({
  children,
  hrefSearchParams = {},
  ...props
}: React.PropsWithChildren<WrapperProps>) {
  return (
    <Wrapper {...props}>
      <HeaderSection>
        <Column>
          <HeaderSection.Logo href={buildTemplateInternalUrl('/ca', hrefSearchParams)}>
            <Img
              alt="Stand With Crypto"
              height="40"
              src={buildTemplateInternalUrl('/ca/email/misc/shield.svg', hrefSearchParams)}
              width="40"
            />
          </HeaderSection.Logo>
        </Column>
        <Column align="right" style={{ display: 'table-cell' }}>
          <HeaderSection.SocialMedia href={CA_SOCIAL_MEDIA_URL.twitter} text="Follow us on">
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
        privacyPolicyHref={buildTemplateInternalUrl('/ca/privacy', hrefSearchParams)}
        sendingEntity={getSWCLegalEntityNameByCountryCode(countryCode)}
        shieldSrc={buildTemplateInternalUrl('/ca/email/misc/shield.svg', hrefSearchParams)}
        swcHref={buildTemplateInternalUrl('/ca', hrefSearchParams)}
      >
        <FooterSection.SocialMedia
          alt="X/Twitter logo"
          href={CA_SOCIAL_MEDIA_URL.twitter}
          src={buildTemplateInternalUrl('/email/misc/xDotComLogo.png', hrefSearchParams)}
        />
        <FooterSection.SocialMedia
          alt="LinkedIn logo"
          href={CA_SOCIAL_MEDIA_URL.linkedin}
          src={buildTemplateInternalUrl('/email/misc/linkedinLogo.png', hrefSearchParams)}
        />
      </FooterSection>
    </Wrapper>
  )
}
