import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export function FooterContent({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground">
      <span className="text-[10px]">{children}</span>
    </p>
  )
}

FooterContent.PrivacyPolicyLink = function PrivacyPolicyLink({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  const urls = getIntlUrls(countryCode)
  return (
    <InternalLink href={urls.privacyPolicy()} target="_blank">
      Stand With Crypto Privacy Policy
    </InternalLink>
  )
}

FooterContent.PrivacyCollectionStatementLink = function PrivacyCollectionStatementLink({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  const urls = getIntlUrls(countryCode)
  return (
    <InternalLink href={urls.privacyCollectionStatement()} target="_blank">
      Privacy Collection Statement
    </InternalLink>
  )
}
