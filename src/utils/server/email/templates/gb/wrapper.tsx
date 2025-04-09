import { Column, Img } from '@react-email/components'

import {
  FooterSection,
  HeaderSection,
  Wrapper,
  WrapperProps,
} from '@/utils/server/email/templates/common/ui/wrapper'
import { GB_SOCIAL_MEDIA_URL } from '@/utils/server/email/templates/gb/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

export function GBWrapper({
  children,
  hrefSearchParams = {},
  ...props
}: React.PropsWithChildren<WrapperProps>) {
  return (
    <Wrapper {...props}>
      <HeaderSection>
        <Column>
          <HeaderSection.Logo href={buildTemplateInternalUrl('/gb', hrefSearchParams)}>
            <Img
              alt="Stand With Crypto"
              height="40"
              src={buildTemplateInternalUrl('/gb/email/misc/shield.svg', hrefSearchParams)}
              width="40"
            />
          </HeaderSection.Logo>
        </Column>
        <Column align="right" style={{ display: 'table-cell' }}>
          <HeaderSection.SocialMedia href={GB_SOCIAL_MEDIA_URL.twitter} text="Follow us on">
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
        shieldSrc={buildTemplateInternalUrl('/gb/email/misc/shield.svg', hrefSearchParams)}
        swchHref={buildTemplateInternalUrl('/gb', hrefSearchParams)}
      >
        <FooterSection.SocialMedia
          alt="X/Twitter logo"
          href={GB_SOCIAL_MEDIA_URL.twitter}
          src={buildTemplateInternalUrl('/email/misc/xDotComLogo.png', hrefSearchParams)}
        />
        <FooterSection.SocialMedia
          alt="LinkedIn logo"
          href={GB_SOCIAL_MEDIA_URL.linkedin}
          src={buildTemplateInternalUrl('/email/misc/linkedinLogo.png', hrefSearchParams)}
        />
      </FooterSection>
    </Wrapper>
  )
}
