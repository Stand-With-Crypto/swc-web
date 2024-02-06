/*
Call this function anywhere we might first be discovering the user who's using the app.
*/
import * as Sentry from '@sentry/nextjs'
import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { identifyClientAnalyticsUser } from '@/utils/web/clientAnalytics'

export function identifyUserOnClient(data: { userId: string } | ClientUser) {
  const id = 'userId' in data ? data.userId : data.id
  identifyClientAnalyticsUser(id)
  Sentry.setUser({ id: id, idType: 'userId' })
}
