import { ArrowRight } from 'lucide-react'

import { EventDialog } from '@/components/app/pageEvents/common/eventDialog'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { cn } from '@/utils/web/cn'

interface FeaturedPastEventsProps {
  events: SWCEvents
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Featured past events',
      viewDetails: 'View details',
    },
    fr: {
      title: 'Événements passés en vedette',
      viewDetails: 'Voir les détails',
    },
    de: {
      title: 'Hervorgehobene vergangene Veranstaltungen',
      viewDetails: 'Details anzeigen',
    },
  },
})

export async function FeaturedPastEvents({
  events,
  countryCode,
  language = SupportedLanguages.EN,
}: FeaturedPastEventsProps) {
  const { t } = await getServerTranslation(
    i18nMessages,
    'featuredPastEvents',
    countryCode,
    language,
  )

  return (
    <section className="grid w-full gap-4">
      <PageTitle as="h3" className="mb-2">
        {t('title')}
      </PageTitle>

      <div
        className={cn('grid gap-4', {
          'md:grid-cols-2 lg:grid-cols-3': events.length > 2,
          'md:grid-flow-col md:justify-center': events.length < 3,
        })}
      >
        {events.map(event => (
          <EventDialog
            event={event.data}
            key={getUniqueEventKey(event.data)}
            trigger={
              <div
                className={cn('group relative w-full', {
                  'md:w-[345px]': events.length < 3,
                })}
                key={getUniqueEventKey(event.data)}
              >
                <div className="relative h-[222px] min-w-[345px] lg:h-[300px] lg:min-w-[300px]">
                  <NextImage
                    alt={event.data.name}
                    className="object-cover object-center"
                    fill
                    src={event.data.image}
                  />
                </div>
                <EventOverlay
                  countryCode={countryCode}
                  eventName={event.data.name}
                  language={language}
                />
              </div>
            }
          />
        ))}
      </div>
    </section>
  )
}

async function EventOverlay({
  eventName,
  countryCode,
  language,
}: {
  eventName: string
  countryCode: SupportedCountryCodes
  language: SupportedLanguages
}) {
  const { t } = await getServerTranslation(
    i18nMessages,
    'featuredPastEventsEventOverlay',
    countryCode,
    language,
  )

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-100 transition-opacity duration-300 ease-in-out group-hover:opacity-100 lg:opacity-0">
      <div className="absolute inset-0 bg-black/80 opacity-75" />

      <div className="relative z-10 flex h-full w-full cursor-pointer flex-col justify-between p-4 text-left text-white">
        <strong className="font-sans text-xl">{eventName}</strong>
        <p className="flex items-center gap-1 self-end text-sm">
          {t('viewDetails')} <ArrowRight size={16} />
        </p>
      </div>
    </div>
  )
}
