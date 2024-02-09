import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { Prisma, User, UserInformationVisibility, UserInternalStatus } from '@prisma/client'

export function mockCreateUserInput({
  withData = faker.helpers.maybe(() => true, { probability: 0.5 }),
}: {
  withData?: boolean
} = {}) {
  return {
    acquisitionCampaign: '',
    acquisitionMedium: '',
    acquisitionReferer: '',
    acquisitionSource: '',
    capitolCanaryAdvocateId: null,
    capitolCanaryInstance: null,
    firstName: withData ? faker.person.firstName() : '',
    hasOptedInToEmails: true,
    hasOptedInToMembership: false,
    hasOptedInToSms: false,
    informationVisibility:
      faker.helpers.maybe(
        () =>
          faker.helpers.arrayElement([
            UserInformationVisibility.ALL_INFO,
            UserInformationVisibility.CRYPTO_INFO_ONLY,
          ]),
        { probability: 0.9 },
      ) || UserInformationVisibility.ANONYMOUS,
    internalStatus: UserInternalStatus.VISIBLE,
    lastName: withData ? faker.person.lastName() : '',
    phoneNumber: withData ? fakerFields.phoneNumber() : '',
  } satisfies Prisma.UserCreateInput
}

export function mockUser(): User {
  const withData = faker.helpers.maybe(() => true, { probability: 0.5 })
  return {
    ...mockCreateUserInput({ withData }),
    ...mockCommonDatetimes(),
    addressId: withData ? fakerFields.id() : null,
    id: fakerFields.id(),
    primaryUserCryptoAddressId: fakerFields.id(),
    primaryUserEmailAddressId: fakerFields.id(),
  }
}
