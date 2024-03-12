import * as Sentry from '@sentry/nextjs'
import { FailureEventArgs } from 'inngest'

import { setPrimaryCryptoAddressOfUser } from '@/bin/oneTimeScripts/setPrimaryCryptoAddressOfUser'
import { inngest } from '@/inngest/inngest'

export interface ScriptPayload {
  userId: string
  cryptoAddressId: string
  persist: boolean
}

async function onFailureSetPrimaryCryptoAddressOfUser(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })
}

const SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_NAME = 'script/set-primary-crypto-address-of-user'
const SET_CRYPTO_ADDRESS_OF_USER_INNGEST_FUNCTION_ID = 'script.set-primary-crypto-address-of-user'
export const setPrimaryCryptoAddressOfUserWithInngest = inngest.createFunction(
  {
    id: SET_CRYPTO_ADDRESS_OF_USER_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onFailureSetPrimaryCryptoAddressOfUser,
  },
  { event: SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload

    await step.run('execute-script', async () => {
      return await setPrimaryCryptoAddressOfUser(
        payload.userId,
        payload.cryptoAddressId,
        payload.persist,
      )
    })

    return {
      dryRun: !payload.persist,
    }
  },
)
