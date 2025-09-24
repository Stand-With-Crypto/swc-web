'use client'

import Balancer from 'react-wrap-balancer'
import { UserActionType } from '@prisma/client'
import { isBefore, startOfDay } from 'date-fns'
import { Clock, Pin } from 'lucide-react'
import sanitizeHtml from 'sanitize-html'
import { toast } from 'sonner'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { EventDialogPhoneNumber } from '@/components/app/pageEvents/common/eventDialogPhoneNumber'
import { EventDialogSocialLinks } from '@/components/app/pageEvents/common/eventDialogSocialLinks'
import { GoogleMapsEmbedIFrame } from '@/components/app/pageEvents/common/eventGoogleMapsEmbedIframe'
import { EventPhotosSlideshow } from '@/components/app/pageEvents/common/eventPhotosSlideshow'
import { SuccessfulEventNotificationsSignup } from '@/components/app/pageEvents/common/successfulEventSignupDialog'
import { handleCreateRsvpAction as _handleCreateRsvpAction } from '@/components/app/pageEvents/utils/createRsvpAction'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StateShield } from '@/components/ui/stateShield'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useSections } from '@/hooks/useSections'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { formatDateTimeForLocale } from '@/utils/shared/i18n/interpolationUtils'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'
import { userHasOptedInToSMS } from '@/utils/shared/sms/userHasOptedInToSMS'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns'
import { SWCEvent } from '@/utils/shared/zod/getSWCEvents'
import { useLanguage } from '@/utils/web/i18n/useLanguage'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

enum SectionNames {
  EVENT_INFO = 'Event Information',
  PHONE_SECTION = 'Phone Section',
  NOTIFICATION_ACTIVATED = 'Event Notification Activated',
}

interface EventDialogContentProps {
  event: SWCEvent
  countryCode: SupportedCountryCodes
}

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      success: 'Thank you for your interest! We will send you a reminder closer to the event.',
      getUpdates: 'Get updates',
      rsvp: 'RSVP',
      logInToGetUpdates: 'Log in to get updates',
    },
    fr: {
      success:
        "Merci pour votre intérêt ! Nous vous enverrons un rappel plus proche de l'événement.",
      getUpdates: 'Obtenir les mises à jour',
      rsvp: 'RSVP',
      logInToGetUpdates: 'Se connecter pour obtenir les mises à jour',
    },
    de: {
      success:
        'Danke für Ihr Interesse! Wir werden Ihnen eine Erinnerung näher zum Ereignis senden.',
      getUpdates: 'Aktualisierungen abrufen',
      rsvp: 'Anmeldung',
      logInToGetUpdates: 'Anmelden für Updates',
    },
  },
})

export function EventDialogContent({ event, countryCode }: EventDialogContentProps) {
  usePreventOverscroll()
  const { t } = useTranslation(i18nMessages, 'eventDialogContent')
  const { data: userFullProfileInfoResponse } = useApiResponseForUserFullProfileInfo()
  const { user } = userFullProfileInfoResponse ?? { user: null }
  const hasOptedInToSMS = userHasOptedInToSMS(user)

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.EVENT_INFO,
    analyticsName: 'Event Details Dialog',
  })

  const [handleCreateRsvpAction, isCreatingRsvpEventAction] =
    useLoadingCallback(_handleCreateRsvpAction)

  const handleGetUpdates = async () => {
    await handleCreateRsvpAction({
      shouldReceiveNotifications: true,
      event,
      campaignName: getActionDefaultCampaignName(UserActionType.RSVP_EVENT, countryCode),
    })

    toast.success(t('success'))
    sectionProps.goToSection(SectionNames.NOTIFICATION_ACTIVATED)
  }

  const handleRSVPButtonClick = () => {
    void handleCreateRsvpAction({
      shouldReceiveNotifications: false,
      event,
      campaignName: getActionDefaultCampaignName(UserActionType.RSVP_EVENT, countryCode),
    })

    window.open(event.rsvpUrl, '_blank')
  }

  if (sectionProps.currentSection === SectionNames.NOTIFICATION_ACTIVATED) {
    return (
      <SuccessfulEventNotificationsSignup
        handleRSVPButtonClick={handleRSVPButtonClick}
        isCreatingRsvpEventAction={isCreatingRsvpEventAction}
      />
    )
  }

  if (sectionProps.currentSection === SectionNames.PHONE_SECTION) {
    return <EventDialogPhoneNumber onSuccess={handleGetUpdates} user={user} />
  }

  return (
    <EventInformation
      event={event}
      handleGetUpdatesButtonClick={async () => {
        if (!hasOptedInToSMS) return sectionProps.goToSection(SectionNames.PHONE_SECTION)

        await handleGetUpdates()
      }}
      handleRSVPButtonClick={handleRSVPButtonClick}
      isCreatingRsvpEventAction={isCreatingRsvpEventAction}
    />
  )
}

function EventInformation({
  event,
  isCreatingRsvpEventAction,
  handleGetUpdatesButtonClick,
  handleRSVPButtonClick,
}: {
  event: SWCEvent
  isCreatingRsvpEventAction: boolean
  handleGetUpdatesButtonClick: () => Promise<void>
  handleRSVPButtonClick: () => void
}) {
  const language = useLanguage()
  const countryCode = useCountryCode()
  const { t } = useTranslation(i18nMessages, 'eventDialogContent')

  const eventDate = event?.time
    ? new Date(`${event.date}T${event.time}`)
    : new Date(`${event.date}T00:00`)

  const formattedEventDate = formatDateTimeForLocale(eventDate, language, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  })

  const isPastEvent = isBefore(startOfDay(eventDate), startOfDay(new Date()))

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="overflow-auto px-4 py-6 md:max-h-[70vh]">
        <div className="flex h-full flex-col items-center gap-2">
          <StateShield
            className="mb-2 lg:mb-0"
            countryCode={countryCode}
            size={100}
            state={event.state}
          />
          <h3 className="text-center font-sans text-xl font-bold">
            <Balancer>{event.name}</Balancer>
          </h3>
          <div className="text-center font-mono text-base text-muted-foreground">
            <Balancer
              className="[&_*]:pb-2 [&_a]:font-medium [&_a]:text-primary-cta [&_strong]:font-semibold [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.formattedDescription) }}
            />
          </div>
          <p className="mt-9 flex items-center gap-2 font-mono text-sm">
            <Clock size={16} /> {formattedEventDate}
          </p>
          <p className="mb-9 mt-5 flex items-center gap-2 font-mono text-sm">
            <Pin size={16} /> {event.formattedAddress}
          </p>

          {isPastEvent ? (
            <EventPhotosSlideshow>
              {event?.carousel?.map(item => (
                <NextImage
                  alt={event.name}
                  className="h-[420px] w-full object-cover"
                  height={420}
                  key={item.photo}
                  src={item.photo}
                  width={466}
                />
              ))}
            </EventPhotosSlideshow>
          ) : (
            <GoogleMapsEmbedIFrame address={event.formattedAddress} />
          )}

          {!isPastEvent && (
            <EventDialogSocialLinks eventSlug={event.slug} eventState={event.state} />
          )}
        </div>
      </ScrollArea>

      {!isPastEvent && (
        <div
          className="z-10 mt-auto flex flex-col items-center justify-end gap-3 border border-t px-4 py-6 lg:flex-row"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
        >
          {isSmsSupportedInCountry(countryCode) && (
            <LoginDialogWrapper
              authenticatedContent={
                <Button
                  className="w-full lg:w-auto"
                  disabled={isCreatingRsvpEventAction}
                  onClick={handleGetUpdatesButtonClick}
                  variant="secondary"
                >
                  {t('getUpdates')}
                </Button>
              }
            >
              <Button className="w-full md:w-1/2" variant="secondary">
                {t('logInToGetUpdates')}
              </Button>
            </LoginDialogWrapper>
          )}

          <Button
            className="w-full lg:w-auto"
            disabled={isCreatingRsvpEventAction}
            onClick={handleRSVPButtonClick}
          >
            {t('rsvp')}
          </Button>
        </div>
      )}
    </div>
  )
}
