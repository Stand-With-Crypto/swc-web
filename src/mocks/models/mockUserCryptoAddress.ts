import { faker } from '@faker-js/faker'
import {
  DataCreationMethod,
  Prisma,
  SupportedUserCryptoNetwork,
  UserCryptoAddress,
} from '@prisma/client'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'

export enum PopularCryptoAddress {
  CHRIS_DIXON = '0xe11bfcbdd43745d4aa6f4f18e24ad24f4623af04',
  BRIAN_ARMSTRONG = '0x5b76f5b8fc9d700624f78208132f91ad4e61a1f0',
}

export function mockCreateUserCryptoAddressInput() {
  return {
    cryptoAddress: parseThirdwebAddress(faker.finance.ethereumAddress()),
    cryptoNetwork: faker.helpers.arrayElement(Object.values(SupportedUserCryptoNetwork)),
  } satisfies Omit<Prisma.UserCryptoAddressCreateInput, 'userId' | 'user'>
}

export function mockUserCryptoAddress(): UserCryptoAddress {
  return {
    ...mockCommonDatetimes(),
    ...mockCreateUserCryptoAddressInput(),
    id: fakerFields.id(),
    embeddedWalletUserEmailAddressId: null,
    userId: fakerFields.id(),
    dataCreationMethod: DataCreationMethod.BY_USER,
    hasBeenVerifiedViaAuth: true,
  }
}
