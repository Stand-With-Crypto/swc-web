import { Column, Img } from '@react-email/components'

import {
  FooterSection,
  HeaderSection,
  Wrapper,
  WrapperProps,
} from '@/utils/server/email/templates/common/ui/wrapper'
import { US_SOCIAL_MEDIA_URL } from '@/utils/server/email/templates/us/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

export function USWrapper({
  children,
  hrefSearchParams = {},
  ...props
}: React.PropsWithChildren<WrapperProps>) {
  return (
    <Wrapper {...props}>
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
        shieldSrc={buildTemplateInternalUrl('/email/misc/shield.png', hrefSearchParams)}
        swchHref={buildTemplateInternalUrl('/', hrefSearchParams)}
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
