import { FooterContent } from '@/components/app/authentication/common/footerContent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.US

export function USFooterContent() {
  return (
    <FooterContent>
      By signing up with your phone number, you consent to receive recurring texts from Stand With
      Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply. You
      understand that Stand With Crypto and its vendors may collect and use your Personal
      Information. To learn more, visit the{' '}
      <FooterContent.PrivacyPolicyLink countryCode={countryCode} />.
    </FooterContent>
  )
}
