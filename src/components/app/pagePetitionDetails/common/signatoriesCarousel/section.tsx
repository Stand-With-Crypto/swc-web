'use client'

import { SignatoriesCarousel } from '@/components/app/pagePetitionDetails/common/signatoriesCarousel'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface SignatoriesCarouselSectionProps {
  countryCode: SupportedCountryCodes
  recentSignatures: Array<{ locale: string; datetimeSigned: string }>
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      recentSigners: 'Recent signers',
    },
    de: {
      recentSigners: 'Neueste Unterschrifter',
    },
    fr: {
      recentSigners: 'Signataires récents',
    },
  },
})

export function SignatoriesCarouselSection({
  countryCode,
  recentSignatures,
}: SignatoriesCarouselSectionProps) {
  const { t } = useTranslation(i18nMessages, 'SignatoriesCarouselSection')

  return (
    <section>
      <h3 className="mb-4 text-xl font-semibold">{t('recentSigners')}</h3>
      <SignatoriesCarousel countryCode={countryCode} lastSignatures={recentSignatures} />
    </section>
  )
}
