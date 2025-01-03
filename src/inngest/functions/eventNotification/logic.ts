import { differenceInDays, format, startOfDay } from 'date-fns'

import { BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/bulkSMSCommunicationJourney'
import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { getEvents } from '@/utils/server/serverCMS/models/data/events'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { getLogger } from '@/utils/shared/logger'

const defaultLogger = getLogger('sendEventNotifications')

interface Notification {
  userId: string
  eventSlug: string
  eventDate: string
  smsBody: string
  phoneNumber: string
}

interface SendEventNotificationsResponse {
  notificationsSent: number
  notifications: Array<Notification>
}

export async function sendEventNotifications(logger = defaultLogger) {
  const allEvents = await getEvents()

  if (!allEvents || !allEvents.length) {
    logger.info('Could not load events from Builder.IO. Ending the script...')
    return
  }

  const now = startOfDay(new Date())

  const eventsInThreeDays = allEvents.filter(event => {
    const eventDate = startOfDay(new Date(event.data.date))

    return differenceInDays(eventDate, now) === 3
  })

  const eventsInOneDay = allEvents.filter(event => {
    const eventDate = startOfDay(new Date(event.data.date))

    return differenceInDays(eventDate, now) === 1
  })

  const batchThreeDaysNotifications = await getNotificationInformationForEvents(
    eventsInThreeDays,
    'three-days',
  )

  const batchOneDayNotifications = await getNotificationInformationForEvents(
    eventsInOneDay,
    'one-day',
  )

  const notifications: Array<Notification> = [
    ...batchThreeDaysNotifications,
    ...batchOneDayNotifications,
  ]

  logger.info(`Sent ${notifications.length} notifications`)

  return {
    notificationsSent: notifications.length,
    notifications,
  } as SendEventNotificationsResponse
}

async function getNotificationInformationForEvents(
  events: SWCEvents,
  notificationStrategy: string,
) {
  const notifications: Array<Notification> = []

  for (const event of events) {
    const rsvpEvents = await prismaClient.userActionRsvpEvent.findMany({
      where: {
        eventSlug: event.data.slug,
        eventState: event.data.state,
        shouldReceiveNotifications: true,
      },
      include: {
        userAction: {
          include: {
            user: true,
          },
        },
      },
    })

    const eventDate = event.data?.time ? `${event.data.date}T${event.data.time}` : event.data.date

    const formattedEventDate = format(new Date(eventDate), 'EEEE M/d')

    const formattedEventTime = format(new Date(eventDate), 'h:mm a')

    const eventDeeplink = `https://www.standwithcrypto.org/events/${event.data.state.toLowerCase()}/${event.data.slug}`
    const smsBody = `Stand With Crypto Event Reminder: ${event.data.name} is happening on ${formattedEventDate}${event.data?.time ? ` at ${formattedEventTime}` : ''}. We look forward to seeing you there! See details or RSVP at ${eventDeeplink}`

    for (const rsvpEvent of rsvpEvents) {
      notifications.push({
        userId: rsvpEvent.userAction.user.id,
        eventSlug: event.data.slug,
        eventDate: eventDate,
        smsBody,
        phoneNumber: rsvpEvent.userAction.user.phoneNumber,
      })
    }

    await inngest.send({
      name: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
      data: {
        send: true,
        messages: [
          {
            campaignName: `event-reminder-${event.data.slug}-${event.data.state}-${notificationStrategy}`,
            smsBody,
            userWhereInput: {
              phoneNumber: {
                in: notifications.map(notification => notification.phoneNumber),
              },
            },
          },
        ],
      },
    })
  }

  return notifications
}
