import { Column, Img } from '@react-email/components'

import {
  FooterSection,
  HeaderSection,
  Wrapper,
  WrapperProps,
} from '@/utils/server/email/templates/common/ui/wrapper'
import { US_SOCIAL_MEDIA_URL } from '@/utils/server/email/templates/us/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import {
  getPhysicalMailingAddressByCountryCode,
  getSWCLegalEntityNameByCountryCode,
} from '@/utils/shared/legalUtils'

export function USWrapper({
  children,
  hrefSearchParams = {},
  countryCode,
  ...props
}: React.PropsWithChildren<WrapperProps>) {
  return (
    <Wrapper {...props} countryCode={countryCode}>
      <HeaderSection>
        <Column>
          <HeaderSection.Logo href={buildTemplateInternalUrl('/', hrefSearchParams)}>
            <Img
              alt="Stand With Crypto"
              height="40"
              src={buildTemplateInternalUrl('/email/misc/shield.png', hrefSearchParams)}
              width="40"
            />
          </HeaderSection.Logo>
        </Column>
        <Column align="right" style={{ display: 'table-cell' }}>
          <HeaderSection.SocialMedia href={US_SOCIAL_MEDIA_URL.twitter} text="Follow us on">
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
        privacyPolicyHref={buildTemplateInternalUrl('/privacy', hrefSearchParams)}
        sendingEntity={getSWCLegalEntityNameByCountryCode(countryCode)}
        shieldSrc={buildTemplateInternalUrl('/email/misc/shield.png', hrefSearchParams)}
        swcHref={buildTemplateInternalUrl('/', hrefSearchParams)}
      >
        <FooterSection.SocialMedia
          alt="Instagram logo"
          href={US_SOCIAL_MEDIA_URL.instagram}
          src={buildTemplateInternalUrl('/email/misc/instagramLogo.png', hrefSearchParams)}
        />
        <FooterSection.SocialMedia
          alt="X/Twitter logo"
          href={US_SOCIAL_MEDIA_URL.twitter}
          src={buildTemplateInternalUrl('/email/misc/xDotComLogo.png', hrefSearchParams)}
        />
        <FooterSection.SocialMedia
          alt="Facebook logo"
          href={US_SOCIAL_MEDIA_URL.facebook}
          src={buildTemplateInternalUrl('/email/misc/facebookLogo.png', hrefSearchParams)}
        />
      </FooterSection>
    </Wrapper>
  )
}
