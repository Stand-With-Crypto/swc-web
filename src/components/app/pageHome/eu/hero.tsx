import Link from 'next/link'

import { Hero, HeroAnnouncementCard } from '@/components/app/pageHome/common/hero'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.EU

interface EuHeroProps {
  language: SupportedLanguages
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: "It's time to support crypto in the EU",
      subtitle:
        "Crypto's future in the EU remains uncertain. If you believe in the power of the blockchain and want the Government to foster a positive business and policy environment for crypto assets and blockchain technology in the EU, make your voice heard.",
      announcementCardCTA: 'Advocate for crypto in the EU',
      announcementCardAuthenticatedButtonText: 'Get started',
      announcementCardUnauthenticatedButtonText: 'Join',
      announcementCardImageAlt:
        'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    },
    de: {
      title: 'Es ist Zeit, sich für Krypto in der EU einzusetzen',
      subtitle:
        'Die Zukunft von Krypto in der EU bleibt ungewiss. Wenn Sie an die Macht der Blockchain glauben und möchten, dass die Regierung ein positives Geschäfts- und politisches Umfeld für Krypto-Assets und Blockchain-Technologie in der EU fördert, lassen Sie Ihre Stimme hören.',
      announcementCardCTA: 'Setzen Sie sich für Krypto in der EU ein',
      announcementCardAuthenticatedButtonText: 'Loslegen',
      announcementCardUnauthenticatedButtonText: 'Beitreten',
      announcementCardImageAlt:
        'Bleiben Sie über die Krypto-Politik auf dem Laufenden, indem Sie @StandWithCrypto auf X folgen.',
    },
    fr: {
      title: "Il est temps de soutenir la crypto dans l'UE",
      subtitle:
        "L'avenir de la crypto dans l'UE reste incertain. Si vous croyez en la puissance de la blockchain et souhaitez que le gouvernement favorise un environnement commercial et politique positif pour les actifs crypto et la technologie blockchain dans l'UE, faites entendre votre voix.",
      announcementCardCTA: "Défendez la crypto dans l'UE",
      announcementCardAuthenticatedButtonText: 'Commencer',
      announcementCardUnauthenticatedButtonText: 'Rejoindre',
      announcementCardImageAlt:
        'Restez informé sur la politique crypto en suivant @StandWithCrypto sur X.',
    },
  },
})

export async function EuHero(props: EuHeroProps) {
  const { language } = props
  const urls = getIntlUrls(countryCode, { language })

  const { t } = await getServerTranslation(i18nMessages, 'euHero', countryCode, language)

  return (
    <Hero>
      <Hero.Heading>
        <Hero.Title>{t('title')}</Hero.Title>
        <Hero.Subtitle>{t('subtitle')}</Hero.Subtitle>
        <Hero.HeadingCTA countryCode={countryCode} />
      </Hero.Heading>
      <HeroAnnouncementCard
        authenticatedContent={
          <Link href={urls.profile()}>
            <HeroAnnouncementCard.Image
              media={{
                src: '/eu/home/hero.svg',
                alt: t('announcementCardImageAlt'),
              }}
            >
              <HeroAnnouncementCard.CTA buttonText={t('announcementCardAuthenticatedButtonText')}>
                {t('announcementCardCTA')}
              </HeroAnnouncementCard.CTA>
            </HeroAnnouncementCard.Image>
          </Link>
        }
        unauthenticatedContent={
          <HeroAnnouncementCard.Image
            media={{
              src: '/eu/home/hero.svg',
              alt: t('announcementCardImageAlt'),
            }}
          >
            <HeroAnnouncementCard.CTA buttonText={t('announcementCardUnauthenticatedButtonText')}>
              {t('announcementCardCTA')}
            </HeroAnnouncementCard.CTA>
          </HeroAnnouncementCard.Image>
        }
      />
    </Hero>
  )
}
