'use server'
import { createCharge } from '@/utils/server/coinbaseCommerce/createCharge'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const actionCreateCoinbaseCommerceCharge = withServerActionMiddleware(
  'actionCreateCoinbaseCommerceCharge',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    _actionCreateCoinbaseCommerceCharge,
  ),
)

async function _actionCreateCoinbaseCommerceCharge() {
  const userMatch = await getMaybeUserAndMethodOfMatch()
  const hostedUrl = (
    await createCharge({ sessionId: getUserSessionId(), userId: userMatch.user?.id ?? '' })
  ).data.hosted_url
  return { hostedUrl }
}
