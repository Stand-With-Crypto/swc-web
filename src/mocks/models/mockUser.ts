import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { Prisma, User, UserInformationVisibility, UserInternalStatus } from '@prisma/client'

export function mockCreateUserInput({
  withData = faker.helpers.maybe(() => true, { probability: 0.5 }),
}: {
  withData?: boolean
} = {}) {
  const isVisible = faker.helpers.maybe(() => true, { probability: 0.9 })
  return {
    acquisitionCampaign: '',
    acquisitionMedium: '',
    acquisitionSource: '',
    acquisitionReferer: '',
    firstName: withData ? faker.person.firstName() : '',
    lastName: withData ? faker.person.lastName() : '',
    informationVisibility:
      faker.helpers.maybe(
        () =>
          faker.helpers.arrayElement([
            UserInformationVisibility.ALL_INFO,
            UserInformationVisibility.CRYPTO_INFO_ONLY,
          ]),
        { probability: 0.9 },
      ) || UserInformationVisibility.ANONYMOUS,
    phoneNumber: withData ? fakerFields.phoneNumber() : '',
    hasOptedInToEmails: true,
    hasOptedInToMembership: false,
    hasOptedInToSms: false,
    internalStatus: isVisible ? UserInternalStatus.VISIBLE : UserInternalStatus.MANUALLY_HIDDEN,
    capitolCanaryAdvocateId: null,
    capitolCanaryInstance: null,
  } satisfies Prisma.UserCreateInput
}

export function mockUser(): User {
  const withData = faker.helpers.maybe(() => true, { probability: 0.5 })
  return {
    ...mockCreateUserInput({ withData }),
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    primaryUserEmailAddressId: fakerFields.id(),
    primaryUserCryptoAddressId: fakerFields.id(),
    addressId: withData ? fakerFields.id() : null,
  }
}
