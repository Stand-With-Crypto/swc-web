import { FooterContent } from '@/components/app/authentication/common/footerContent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export function AUFooterContent() {
  return (
    <FooterContent>
      By signing up, you consent to and understand that Stand With Crypto and its vendors may
      collect and use your Personal Information. To learn more, visit our{' '}
      <FooterContent.PrivacyCollectionStatementLink countryCode={countryCode} /> and the{' '}
      <FooterContent.PrivacyPolicyLink countryCode={countryCode} />.
    </FooterContent>
  )
}
