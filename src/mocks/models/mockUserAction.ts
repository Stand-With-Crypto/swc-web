import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { UserAction } from '@prisma/client'

export function mockUserAction(): UserAction {
  const user = faker.helpers.arrayElement([
    { cryptoAddressUserId: fakerFields.id(), sessionUserId: null },
    { sessionUserId: fakerFields.id(), cryptoAddressUserId: null },
  ])

  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    ...user,
    inferredUserId: fakerFields.id(),
    datetimeOccurred: faker.date.past(),
  }
}
