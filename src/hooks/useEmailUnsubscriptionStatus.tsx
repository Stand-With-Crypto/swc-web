'use client'

import useSWR, { SWRConfiguration } from 'swr'

import { getEmailUnsubscriptionStatus } from '@/utils/server/sendgrid/marketing/suppresions'

export function useEmailUnsubscriptionStatus(
  emailAddress: string,
  config?: SWRConfiguration<Awaited<ReturnType<typeof getEmailUnsubscriptionStatus>>>,
) {
  return useSWR(
    emailAddress ? `useEmailUnsubscriptionStatus-${emailAddress}` : null,
    async () => await getEmailUnsubscriptionStatus(emailAddress),
    config,
  )
}
