import { faker } from '@faker-js/faker'
import {
  DataCreationMethod,
  Prisma,
  SMSStatus,
  User,
  UserInformationVisibility,
  UserInternalStatus,
} from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

import { SupportedLocale } from '@/intl/locales'
import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'

export function mockCreateUserInput({
  withData = faker.helpers.maybe(() => true, { probability: 0.5 }),
}: {
  withData?: boolean
} = {}) {
  return {
    referralId: fakerFields.generateReferralId(),
    acquisitionCampaign: 'MOCK_ACQUISITION_CAMPAIGN',
    acquisitionMedium: 'MOCK_ACQUISITION_MEDIUM',
    acquisitionSource: 'MOCK_ACQUISITION_SOURCE',
    acquisitionReferer: 'MOCK_ACQUISITION_REFERER',
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
    smsStatus: SMSStatus.NOT_OPTED_IN,
    hasValidPhoneNumber: true,
    internalStatus: UserInternalStatus.VISIBLE,
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
    dataCreationMethod: DataCreationMethod.BY_USER,
    addressId: withData ? fakerFields.id() : null,
    totalDonationAmountUsd: new Decimal(
      faker.number.float({ min: 0, max: 30000, multipleOf: 0.01 }),
    ),
    locale:
      faker.helpers.maybe(
        () => faker.helpers.arrayElement([SupportedLocale.EN_US, SupportedLocale.EN_UK]),
        { probability: 0.5 },
      ) || null,
  }
}
