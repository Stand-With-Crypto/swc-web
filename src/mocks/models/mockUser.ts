import { faker } from '@faker-js/faker'
import {
  DataCreationMethod,
  Prisma,
  User,
  UserInformationVisibility,
  UserInternalStatus,
} from '@prisma/client'

import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { mockAddress } from '@/mocks/models/mockAddress'

export function mockCreateUserInput({
  withData = faker.helpers.maybe(() => true, { probability: 0.5 }),
}: {
  withData?: boolean
} = {}) {
  return {
    referralId: fakerFields.generateReferralId(),
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
    internalStatus: UserInternalStatus.VISIBLE,
    capitolCanaryAdvocateId: null,
    capitolCanaryInstance: null,
  } satisfies Prisma.UserCreateInput
}

export function mockUser(): User & { address: ClientAddress } {
  const withData = faker.helpers.maybe(() => true, { probability: 0.5 })
  return {
    ...mockCreateUserInput({ withData }),
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    primaryUserEmailAddressId: fakerFields.id(),
    primaryUserCryptoAddressId: fakerFields.id(),
    dataCreationMethod: DataCreationMethod.BY_USER,
    addressId: withData ? fakerFields.id() : null,
    address: getClientAddress(mockAddress()),
  }
}
