import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { SupportedUserCryptoNetwork, UserCryptoAddress } from '@prisma/client'

export function mockUserCryptoAddress(): UserCryptoAddress {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    embeddedWalletUserEmailAddressId: null,
    cryptoAddress: faker.finance.ethereumAddress(),
    cryptoNetwork: faker.helpers.arrayElement(Object.values(SupportedUserCryptoNetwork)),
    userId: fakerFields.id(),
  }
}
