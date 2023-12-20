import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { UserAction, UserActionType } from '@prisma/client'

export function mockUserAction(): UserAction {
  const user = faker.helpers.arrayElement([
    { cryptoAddressUserId: fakerFields.id(), sessionUserId: null },
    { sessionUserId: fakerFields.id(), cryptoAddressUserId: null },
  ])

  return {
    ...mockCommonDatetimes(),
    ...user,
    actionType: faker.helpers.arrayElement(Object.values(UserActionType)),
    nftMintId: null,
    id: fakerFields.id(),
    inferredUserId: fakerFields.id(),
    datetimeOccurred: faker.date.past(),
  }
}
