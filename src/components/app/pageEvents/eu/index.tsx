import { isAfter, isBefore, parseISO, startOfDay, subDays } from 'date-fns'

import { AllUpcomingEvents } from '@/components/app/pageEvents/components/allUpcomingEvents'
import { EventDialog } from '@/components/app/pageEvents/components/eventDialog'
import { EventsIntro } from '@/components/app/pageEvents/components/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/components/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/components/featuredPastEvents'
import * as PromotedEvents from '@/components/app/pageEvents/components/promotedEvents'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { I18nMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedEULanguages } from '@/utils/shared/supportedLocales'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { cn } from '@/utils/web/cn'

export interface EUEventsPageProps {
  events: SWCEvents | null
  isDeepLink?: boolean
  language: SupportedEULanguages
}

const i18nMessages: I18nMessages = {
  en: {
    title: 'Events',
    description:
      'Stand With Crypto Alliance is dedicated to engaging and empowering the crypto community both online and at real-world events. Crypto is a major force in our economy, our politics, and our culture – but we need to keep up the momentum.',
    rvsp: 'RSVP',
    seeWhatHappened: 'See what happened',
  },
  de: {
    title: 'Veranstaltungen',
    description:
      'Stand With Crypto veranstaltet landesweit Events, um die Krypto-Community zu organisieren, zu aktivieren und zu stärken. Krypto ist eine wichtige Kraft in unserer Wirtschaft, Politik und Kultur – aber wir müssen den Schwung beibehalten.',
    rvsp: 'Anmelden',
    seeWhatHappened: 'Sehen Sie, was passiert ist',
  },
  fr: {
    title: 'Événements',
    description:
      "Stand With Crypto organise des événements à travers le pays pour organiser, activer et dynamiser la communauté crypto. La crypto est une force majeure dans notre économie, notre politique et notre culture – mais nous devons maintenir l'élan.",
    rvsp: 'RSVP',
    seeWhatHappened: "Voir ce qui s'est passé",
  },
}

const countryCode = SupportedCountryCodes.EU

export async function EUEventsPage({ events, isDeepLink, language }: EUEventsPageProps) {
  const { t } = await getServerTranslation(i18nMessages, 'events', language)

  const futureEvents = events?.filter(event =>
    isAfter(parseISO(event.data.date), subDays(new Date(), 1)),
  )

  const promotedEvents = futureEvents
    ?.filter(event => !!event.data.promotedPositioning)
    .sort((a, b) => a.data.promotedPositioning! - b.data.promotedPositioning!)

  const featuredPastEvents = events?.filter(event => {
    const eventDate = event.data?.time
      ? new Date(`${event.data.date}T${event.data.time}`)
      : new Date(event.data.date)

    return isBefore(eventDate, new Date())
  })

  return (
    <div
      className={cn(
        'standard-spacing-from-navbar container flex w-full flex-col items-center gap-10 px-6 sm:gap-20 lg:gap-[6.25rem]',
        isDeepLink && 'h-screen',
      )}
    >
      <EventsIntro>
        <PageTitle>{t('title')}</PageTitle>
        <PageSubTitle>{t('description')}</PageSubTitle>
      </EventsIntro>

      {promotedEvents && promotedEvents.length > 0 && (
        <PromotedEvents.Root>
          <>
            {promotedEvents.map(event => {
              const eventDate = event.data.time
                ? new Date(`${event.data.date}T${event.data.time}`)
                : new Date(event.data.date)

              const isPastEvent = isBefore(startOfDay(eventDate), startOfDay(new Date()))

              return (
                <PromotedEvents.Event
                  action={
                    isPastEvent ? (
                      <EventDialog
                        event={event.data}
                        trigger={
                          <Button
                            asChild
                            className="mt-2 w-full sm:w-fit lg:mt-4"
                            variant="secondary"
                          >
                            <span>{t('seeWhatHappened')}</span>
                          </Button>
                        }
                        triggerClassName="w-full sm:w-fit"
                      />
                    ) : (
                      <PromotedEvents.RsvpButton countryCode={countryCode} event={event.data}>
                        {t('rvsp')}
                      </PromotedEvents.RsvpButton>
                    )
                  }
                  countryCode={countryCode}
                  event={event.data}
                  key={event.data.slug}
                />
              )
            })}
          </>
        </PromotedEvents.Root>
      )}

      <EventsNearYou events={futureEvents ?? []} />

      {futureEvents && futureEvents.length > 0 && (
        <AllUpcomingEvents countryCode={countryCode} events={futureEvents} showMap={false} />
      )}

      {featuredPastEvents && featuredPastEvents.length > 0 && (
        <FeaturedPastEvents events={featuredPastEvents} />
      )}
    </div>
  )
}
