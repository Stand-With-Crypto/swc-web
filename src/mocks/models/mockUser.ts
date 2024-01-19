import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { User } from '@prisma/client'

export function mockUser(): User {
  const withData = faker.helpers.maybe(() => true, { probability: 0.5 })
  return {
    ...mockCommonDatetimes(),
    acquisitionCampaign: '',
    acquisitionMedium: '',
    acquisitionSource: '',
    acquisitionReferer: '',
    id: fakerFields.id(),
    primaryUserEmailAddressId: fakerFields.id(),
    primaryUserCryptoAddressId: fakerFields.id(),
    sampleDatabaseIncrement: 0,
    fullName: withData ? faker.person.fullName() : '',
    isPubliclyVisible: faker.helpers.maybe(() => true, { probability: 0.9 }) || false,
    phoneNumber: withData ? fakerFields.phoneNumber() : '',
    addressId: withData ? fakerFields.id() : null,
  }
}
