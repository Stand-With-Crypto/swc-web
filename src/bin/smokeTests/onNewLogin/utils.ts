import { faker } from '@faker-js/faker'
import { isFunction } from 'lodash-es'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { fakerFields } from '@/mocks/fakerUtils'
import { ThirdwebEmbeddedWalletMetadata } from '@/utils/server/thirdweb/fetchEmbeddedWalletMetadataFromThirdweb'
import { onNewLogin } from '@/utils/server/thirdweb/onLogin'

/**
 * Run this script only after you've wiped your database.
 */
type Params = Parameters<typeof onNewLogin>[0]
export type Issue = string
export interface TestCase {
  name: string
  parameters: () => Promise<Params>
  validateResults: (data: Awaited<ReturnType<typeof onNewLogin>>, issues: Issue[]) => void
}

export function getDefaultParameters(): Params {
  return {
    cryptoAddress: parseThirdwebAddress(faker.finance.ethereumAddress()),
    localUser: null,
    getUserSessionId: () => Promise.resolve(fakerFields.id()),
    searchParams: {},
    // dependency injecting this in to the function so we can mock it in tests
    injectedFetchEmbeddedWalletMetadataFromThirdweb: () => Promise.resolve(null),
  }
}

export async function mockEmbeddedWalletMetadata(
  email: string,
): Promise<ThirdwebEmbeddedWalletMetadata> {
  return {
    userId: 'string',
    walletAddress: 'string',
    email,
    createdAt: new Date().toISOString(),
  }
}

export function verify(
  condition: any | (() => any),
  expectedCondition: boolean,
  label: string,
  issues: Issue[],
) {
  const conditionResult = isFunction(condition) ? condition() : condition
  if (!!conditionResult !== expectedCondition) {
    issues.push(
      `${label} was ${JSON.stringify(conditionResult)} but expected to be ${
        expectedCondition ? 'truthy' : 'falsy'
      }`,
    )
  }
}
