'use server'
import { createCharge } from '@/utils/server/coinbaseCommerce/createCharge'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'

export const actionCreateCoinbaseCommerceCharge = withServerActionMiddleware(
  'actionCreateCoinbaseCommerceCharge',
  _actionCreateCoinbaseCommerceCharge,
)

async function _actionCreateCoinbaseCommerceCharge() {
  const hostedUrl = (await createCharge(getUserSessionId())).data.hosted_url
  return { hostedUrl }
}
