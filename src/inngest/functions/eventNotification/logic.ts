import { differenceInDays, format, startOfDay } from 'date-fns'
import { boolean, number, object, z } from 'zod'

import { BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/bulkSMSCommunicationJourney'
import { inngest } from '@/inngest/inngest'
import { getEvents } from '@/utils/server/builderIO/swcEvents'
import { prismaClient } from '@/utils/server/prismaClient'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('sendEventNotifications')

export const zodSendEventNotificationParameters = object({
  limit: number().optional(),
  persist: boolean().optional(),
})

interface Notification {
  userId: string
  eventSlug: string
  eventDate: string
  smsBody: string
  phoneNumber: string
}

interface SendEventNotificationsResponse {
  dryRun: boolean
  notificationsSent: number
  notifications: Array<Notification>
}

export async function sendEventNotifications(
  parameters: z.infer<typeof zodSendEventNotificationParameters>,
) {
  zodSendEventNotificationParameters.parse(parameters)

  const { persist } = parameters

  const allEvents = await getEvents()

  if (!allEvents || !allEvents.length) {
    throw new Error('No events found')
  }

  const now = startOfDay(new Date())

  const eventsInThreeDays = allEvents.filter(event => {
    const eventDate = startOfDay(new Date(event.data.datetime))

    return differenceInDays(eventDate, now) === 3
  })

  const eventsInOneDay = allEvents.filter(event => {
    const eventDate = startOfDay(new Date(event.data.datetime))

    return differenceInDays(eventDate, now) === 1
  })

  const batchThreeDaysNotifications = await getNotificationInformationForEvents(
    eventsInThreeDays,
    persist,
  )

  const batchOneDayNotifications = await getNotificationInformationForEvents(
    eventsInOneDay,
    persist,
  )

  const notifications: Array<Notification> = [
    ...batchThreeDaysNotifications,
    ...batchOneDayNotifications,
  ]

  if (persist === undefined || !persist) {
    logger.info('Dry run, exiting')
    return {
      dryRun: true,
      notificationsSent: 0,
      notifications,
    } as SendEventNotificationsResponse
  }

  return {
    dryRun: true,
    notificationsSent: notifications.length,
    notifications,
  } as SendEventNotificationsResponse
}

async function getNotificationInformationForEvents(
  events: SWCEvents,
  persist: boolean | undefined,
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

    const formattedEventDate = format(new Date(event.data.datetime), 'EEEE M/d h:mm a')
    const eventDeeplink = `https://www.standwithcrypto.org//${event.data.state.toLowerCase()}/${event.data.slug}`
    const smsBody = `Stand With Crypto Event Reminder: You registered for ${event.data.name} at ${formattedEventDate} in ${event.data.formattedAddress}. We look forward to seeing you there! See event details: ${eventDeeplink}`

    for (const rsvpEvent of rsvpEvents) {
      notifications.push({
        userId: rsvpEvent.userAction.user.id,
        eventSlug: event.data.slug,
        eventDate: event.data.datetime,
        smsBody,
        phoneNumber: rsvpEvent.userAction.user.phoneNumber,
      })
    }

    if (persist) {
      await inngest.send({
        name: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
        data: {
          send: true,
          smsBody,
          userWhereInput: {
            phoneNumber: {
              in: notifications.map(notification => notification.phoneNumber),
            },
          },
        },
      })
    }
  }

  return notifications
}
