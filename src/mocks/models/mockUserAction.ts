import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { UserAction, UserActionType } from '@prisma/client'

export function mockUserAction({
  actionType,
  userCryptoAddressId,
  userSessionId,
  userEmailAddressId,
}: Pick<
  UserAction,
  'actionType' | 'userCryptoAddressId' | 'userEmailAddressId' | 'userSessionId'
>): UserAction {
  return {
    ...mockCommonDatetimes(),
    actionType,
    userCryptoAddressId,
    userSessionId,
    userEmailAddressId,
    nftMintId: null,
    id: fakerFields.id(),
    userId: fakerFields.id(),
    datetimeOccurred: faker.date.past(),
  }
}
