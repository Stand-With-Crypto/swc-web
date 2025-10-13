import { Column, Img } from '@react-email/components'

import {
  FooterSection,
  HeaderSection,
  Wrapper,
  WrapperProps,
} from '@/utils/server/email/templates/common/ui/wrapper'
import { EU_SOCIAL_MEDIA_URL } from '@/utils/server/email/templates/eu/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import {
  getPhysicalMailingAddressByCountryCode,
  getSWCLegalEntityNameByCountryCode,
} from '@/utils/shared/legalUtils'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      followUsOn: 'Follow us on',
    },
    fr: {
      followUsOn: 'Suivez-nous sur',
    },
    de: {
      followUsOn: 'Folgen Sie uns auf',
    },
  },
})

export function EUWrapper({
  children,
  hrefSearchParams = {},
  countryCode,
  language = SupportedLanguages.EN,
  ...props
}: React.PropsWithChildren<WrapperProps & { language: SupportedLanguages }>) {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

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
          <HeaderSection.SocialMedia href={EU_SOCIAL_MEDIA_URL.twitter} text={t('followUsOn')}>
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
        countryCode={countryCode}
        language={language}
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
