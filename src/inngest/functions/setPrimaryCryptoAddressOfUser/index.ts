import { setPrimaryCryptoAddressOfUser } from '@/inngest/functions/setPrimaryCryptoAddressOfUser/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

const SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_NAME = 'script/set-primary-crypto-address-of-user'
const SET_CRYPTO_ADDRESS_OF_USER_INNGEST_FUNCTION_ID = 'script.set-primary-crypto-address-of-user'

export const setPrimaryCryptoAddressOfUserWithInngest = inngest.createFunction(
  {
    id: SET_CRYPTO_ADDRESS_OF_USER_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: SET_CRYPTO_ADDRESS_OF_USER_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const payload = event.data
    await step.run('execute-script', async () => {
      return await setPrimaryCryptoAddressOfUser(
        {
          userId: payload.userId,
          cryptoAddressId: payload.cryptoAddressId,
          persist: payload.persist,
        },
        logger,
      )
    })

    return {
      dryRun: !payload.persist,
    }
  },
)
