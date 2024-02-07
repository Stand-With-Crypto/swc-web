'use server'
import { createCharge } from '@/utils/server/coinbaseCommerce/createCharge'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'

export const actionCreateCoinbaseCommerceCharge = withServerActionMiddleware(
  'actionCreateCoinbaseCommerceCharge',
  _actionCreateCoinbaseCommerceCharge,
)

async function _actionCreateCoinbaseCommerceCharge() {
  const user = await getMaybeUserAndMethodOfMatch({})
  const hostedUrl = (
    await createCharge({ sessionId: getUserSessionId(), userId: user.user?.id ?? '' })
  ).data.hosted_url
  return { hostedUrl }
}
