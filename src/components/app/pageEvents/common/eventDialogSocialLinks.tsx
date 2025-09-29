'use client'
import { Facebook, Link, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'
import { useCountryCode } from '@/hooks/useCountryCode'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { fullUrl, getIntlUrls } from '@/utils/shared/urls'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      share: 'Share',
      emailSubject: 'Event from Stand with Crypto',
      emailBody:
        'I found an event I’m interested in from Stand with Crypto and wanted to share it with you.  Stand With Crypto is a pro-crypto organization dedicated to activating and mobilizing the crypto community. Find more information about the event here: {eventDeeplink}',
      twitterText:
        'I’m interested in an event from @StandWithCrypto! It’s time to make our voices heard and protect the future of crypto in America. Learn more about the event here:',
    },
    fr: {
      share: 'Partager',
      emailSubject: 'Événement de Stand with Crypto',
      emailBody:
        "J'ai trouvé un événement qui m'intéresse de la part de Stand with Crypto et je voulais le partager avec vous. Stand With Crypto est une organisation pro-crypto dédiée à l'activation et à la mobilisation de la communauté crypto. Trouvez plus d'informations sur l'événement ici: {eventDeeplink}",
      twitterText:
        'Je suis intéressé par un événement de @StandWithCrypto! Il est temps de faire entendre nos voix et de protéger le futur du crypto en Amérique. Trouvez plus d’informations sur l’événement ici:',
    },
    de: {
      share: 'Teilen',
      emailSubject: 'Ereignis von Stand with Crypto',
      emailBody:
        'Ich habe ein Ereignis von Stand with Crypto gefunden, das mich interessiert, und wollte es mit Ihnen teilen. Stand With Crypto ist eine pro-Krypto-Organisation, die sich der Aktivierung und Mobilisierung der Krypto-Community widmet. Weitere Informationen zum Ereignis finden Sie hier: {eventDeeplink}',
      twitterText:
        'Ich bin interessiert an einem Ereignis von @StandWithCrypto! Es ist Zeit, unsere Stimmen zu hören und die Zukunft des Crypto in Amerika zu schützen. Finden Sie weitere Informationen zum Ereignis hier:',
    },
  },
})

export function EventDialogSocialLinks({
  eventState,
  eventSlug,
}: {
  eventState: string
  eventSlug: string
}) {
  const countryCode = useCountryCode()
  const { t } = useTranslation(i18nMessages, 'eventDialogSocialLinks')
  const urls = getIntlUrls(countryCode)

  const [_, handleCopyToClipboard] = useCopyTextToClipboard()
  const eventDeeplink = fullUrl(urls.eventDeepLink(eventState.toLowerCase(), eventSlug))

  return (
    <div className="mt-6 flex flex-col gap-2">
      <h5 className="text-center font-mono text-base font-bold">{t('share')}</h5>

      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={() => {
            void handleCopyToClipboard(eventDeeplink)
          }}
          variant="link"
        >
          <Link size={20} />
        </Button>

        <Button asChild className="inline-block lg:hidden" variant="link">
          <a
            href={`mailto:?subject=${t('emailSubject')}&body=${t('emailBody', { eventDeeplink })}`}
          >
            <Mail size={20} />
          </a>
        </Button>

        <Button asChild variant="link">
          <a
            href={`http://twitter.com/share?url=${eventDeeplink}&hashtags=StandWithCrypto&text=${t('twitterText')}`}
            target="_blank"
          >
            <NextImage alt="Share on X" height={20} src="/socialIcons/x.svg" width={20} />
          </a>
        </Button>

        <Button asChild variant="link">
          <a href={`https://www.facebook.com/sharer.php?u=${eventDeeplink}`} target="_blank">
            <Facebook size={20} />
          </a>
        </Button>
      </div>
    </div>
  )
}
