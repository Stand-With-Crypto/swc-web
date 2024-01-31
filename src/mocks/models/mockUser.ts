import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { User, UserInformationVisibility, UserInternalStatus } from '@prisma/client'

export function mockUser(): User {
  const withData = faker.helpers.maybe(() => true, { probability: 0.5 })
  const isVisible = faker.helpers.maybe(() => true, { probability: 0.9 })
  return {
    ...mockCommonDatetimes(),
    acquisitionCampaign: '',
    acquisitionMedium: '',
    acquisitionSource: '',
    acquisitionReferer: '',
    id: fakerFields.id(),
    primaryUserEmailAddressId: fakerFields.id(),
    primaryUserCryptoAddressId: fakerFields.id(),
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
    addressId: withData ? fakerFields.id() : null,
    hasOptedInToEmails: true,
    hasOptedInToMembership: false,
    hasOptedInToSms: false,
    internalStatus: isVisible ? UserInternalStatus.VISIBLE : UserInternalStatus.MANUALLY_HIDDEN,
    capitolCanaryAdvocateId: null,
    capitolCanaryInstance: null,
  }
}
