import { Column, Img } from '@react-email/components'

import { AU_SOCIAL_MEDIA_URL } from '@/utils/server/email/templates/au/constants'
import {
  getEmailPhysicalMailingAddressByCountryCode,
  getEmailSendingEntityByCountryCode,
} from '@/utils/server/email/templates/common/constants'
import {
  FooterSection,
  HeaderSection,
  Wrapper,
  WrapperProps,
} from '@/utils/server/email/templates/common/ui/wrapper'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export function AUWrapper({
  children,
  hrefSearchParams = {},
  ...props
}: React.PropsWithChildren<WrapperProps>) {
  return (
    <Wrapper {...props}>
      <HeaderSection>
        <Column>
          <HeaderSection.Logo href={buildTemplateInternalUrl('/au', hrefSearchParams)}>
            <Img
              alt="Stand With Crypto"
              height="40"
              src={buildTemplateInternalUrl('/au/email/misc/shield.svg', hrefSearchParams)}
              width="40"
            />
          </HeaderSection.Logo>
        </Column>
        <Column align="right" style={{ display: 'table-cell' }}>
          <HeaderSection.SocialMedia href={AU_SOCIAL_MEDIA_URL.twitter} text="Follow us on">
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
        physicalMailingAddress={getEmailPhysicalMailingAddressByCountryCode(countryCode)}
        sendingEntity={getEmailSendingEntityByCountryCode(countryCode)}
        shieldSrc={buildTemplateInternalUrl('/au/email/misc/shield.svg', hrefSearchParams)}
        swcHref={buildTemplateInternalUrl('/au', hrefSearchParams)}
      >
        <FooterSection.SocialMedia
          alt="X/Twitter logo"
          href={AU_SOCIAL_MEDIA_URL.twitter}
          src={buildTemplateInternalUrl('/email/misc/xDotComLogo.png', hrefSearchParams)}
        />
        <FooterSection.SocialMedia
          alt="LinkedIn logo"
          href={AU_SOCIAL_MEDIA_URL.linkedin}
          src={buildTemplateInternalUrl('/email/misc/linkedinLogo.png', hrefSearchParams)}
        />
      </FooterSection>
    </Wrapper>
  )
}
