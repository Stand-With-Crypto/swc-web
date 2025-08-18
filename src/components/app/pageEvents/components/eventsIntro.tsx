'use client'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useTranslation } from '@/hooks/useLanguage'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

const translations = {
  [SupportedLocale.EN_US]: {
    title: 'Events',
    subtitle:
      'Stand With Crypto Alliance is dedicated to engaging and empowering the crypto community both online and at real-world events. Crypto is a major force in our economy, our politics, and our culture – but we need to keep up the momentum.',
  },
  [SupportedLocale.FR_CA]: {
    title: 'Événements',
    subtitle:
      "Stand With Crypto Alliance se consacre à l'engagement et à l'autonomisation de la communauté crypto en ligne et lors d'événements dans le monde réel. La crypto est une force majeure dans notre économie, notre politique et notre culture – mais nous devons maintenir l'élan.",
  },
}

export function EventsIntro() {
  const t = useTranslation(translations)

  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4 lg:gap-6">
        <PageTitle>{t.title}</PageTitle>
        <PageSubTitle>{t.subtitle}</PageSubTitle>
      </div>
    </section>
  )
}
