'use server'
import { createCharge } from '@/utils/server/coinbaseCommerce/createCharge'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'

export const actionCreateCoinbaseCommerceCharge = withServerActionMiddleware(
  'actionCreateCoinbaseCommerceCharge',
  _actionCreateCoinbaseCommerceCharge,
)

async function _actionCreateCoinbaseCommerceCharge() {
  return await createCharge(getUserSessionId())
}
