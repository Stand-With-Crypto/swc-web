import { FooterContent } from '@/components/app/authentication/common/footerContent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export function GBFooterContent() {
  return (
    <FooterContent>
      By signing up, you consent to and understand that Stand With Crypto and its vendors may
      collect and use your Personal Information. To learn more, visit the{' '}
      <FooterContent.PrivacyPolicyLink countryCode={countryCode} />.
    </FooterContent>
  )
}
