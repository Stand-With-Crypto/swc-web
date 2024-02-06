'use server'
import { createCharge } from '@/utils/server/coinbaseCommerce/createCharge'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'

export const actionCreateCoinbaseCommerceCharge = withServerActionMiddleware(
  'actionCreateCoinbaseCommerceCharge',
  _actionCreateCoinbaseCommerceCharge,
)

async function _actionCreateCoinbaseCommerceCharge() {
  const authUser = await appRouterGetAuthUser()
  const hostedUrl = (
    await createCharge({ sessionId: getUserSessionId(), userId: authUser?.userId ?? '' })
  ).data.hosted_url
  return { hostedUrl }
}
