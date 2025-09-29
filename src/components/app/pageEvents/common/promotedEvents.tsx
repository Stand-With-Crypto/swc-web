'use client'

import { UserActionType } from '@prisma/client'
import { isBefore, startOfDay } from 'date-fns'
import sanitizeHtml from 'sanitize-html'

import { EventDialog } from '@/components/app/pageEvents/common/eventDialog'
import { handleCreateRsvpAction } from '@/components/app/pageEvents/utils/createRsvpAction'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns'
import { SWCEvent, SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface PromotedEventsProps {
  events: SWCEvents
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      rsvp: 'RSVP',
      seeWhatHappened: 'See what happened',
    },
    fr: {
      rsvp: 'RSVP',
      seeWhatHappened: "Voir ce qui s'est passé",
    },
    de: {
      rsvp: 'Anmeldung',
      seeWhatHappened: 'Was ist passiert',
    },
  },
})

export function PromotedEvents({ events, countryCode }: PromotedEventsProps) {
  const { t } = useTranslation(i18nMessages, 'events')

  const handleRSVPButtonClick = (event: SWCEvent) => {
    void handleCreateRsvpAction({
      shouldReceiveNotifications: false,
      event,
      campaignName: getActionDefaultCampaignName(UserActionType.RSVP_EVENT, countryCode),
    })

    window.open(event.rsvpUrl, '_blank')
  }

  return (
    <section className="flex flex-col items-center gap-8">
      {events.map(event => {
        const eventDate = event.data?.time
          ? new Date(`${event.data.date}T${event.data.time}`)
          : new Date(event.data.date)

        const isPastEvent = isBefore(startOfDay(eventDate), startOfDay(new Date()))

        return (
          <div
            className="flex flex-col items-center gap-4 lg:flex-row lg:gap-6"
            key={getUniqueEventKey(event.data)}
          >
            <div className="relative h-[182px] min-w-[271px]">
              <NextImage
                alt={event.data.name}
                className="rounded-3xl object-cover object-center"
                fill
                sizes="(max-width: 640px) 100vw, 271px"
                src={event.data.image}
              />
            </div>

            <div className="grid justify-items-center gap-2 lg:justify-items-start">
              <PageSubTitle as="h3" className="text-bold font-sans text-base text-foreground">
                {event.data.name}
              </PageSubTitle>
              <div
                className="line-clamp-3 text-center font-mono text-base text-muted-foreground lg:text-left [&_a]:font-medium [&_a]:text-primary-cta [&_strong]:font-semibold [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(event.data.formattedDescription),
                }}
              />

              {isPastEvent ? (
                <EventDialog
                  event={event.data}
                  trigger={
                    <Button asChild className="mt-2 w-full sm:w-fit lg:mt-4" variant="secondary">
                      <span>{t('seeWhatHappened')}</span>
                    </Button>
                  }
                  triggerClassName="w-full sm:w-fit"
                />
              ) : (
                <Button
                  className="mt-2 w-full sm:w-fit lg:mt-4"
                  onClick={() => handleRSVPButtonClick(event.data)}
                  type="button"
                  variant="secondary"
                >
                  {t('rsvp')}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </section>
  )
}
