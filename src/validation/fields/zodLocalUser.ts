import { object, string, record } from 'zod'

export const zodLocalUser = object({
  persisted: object({
    initialSearchParams: record(string(), string()),
    initialReferer: string().nullable(),
    datetimeFirstSeen: string(),
  }).nullable(),
  currentSession: object({
    datetimeOnLoad: string(),
    refererOnLoad: string().nullable(),
    searchParamsOnLoad: record(string(), string()),
  }),
})
