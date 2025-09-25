import { SignatoriesCarousel } from '@/components/app/pagePetitionDetails/common/signatoriesCarousel'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface SignatoriesCarouselSectionProps {
  countryCode: SupportedCountryCodes
  recentSignatures: Array<{ locale: string; datetimeSigned: string }>
}

export function SignatoriesCarouselSection({
  countryCode,
  recentSignatures,
}: SignatoriesCarouselSectionProps) {
  return (
    <section>
      <h3 className="mb-4 text-xl font-semibold">Recent signers</h3>
      <SignatoriesCarousel countryCode={countryCode} lastSignatures={recentSignatures} />
    </section>
  )
}
