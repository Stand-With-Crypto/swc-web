import {
  DTSI_Gender,
  DTSI_Person,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonResolvers,
} from '@/data/dtsi/generated'
import { fakerFields } from '@/mocks/fakerUtils'
import { faker } from '@faker-js/faker'

export const dtsiPersonMockResolver = (): Partial<DTSI_PersonResolvers> => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    computedStanceScore: () => fakerFields.dtsiStanceScore(),
    firstName: () => 'Formal First Name',
    firstNickname: () => firstName,
    gender: () => faker.helpers.arrayElement(Object.values(DTSI_Gender)),
    isPubliclyVisible: () => true,
    lastName: () => lastName,
    manuallyOverriddenStanceScore: () => null,
    middleName: () => faker.person.middleName(),
    nameSuffix: () => faker.person.suffix(),
    nameUniquenessModifier: () => '',
    officialUrl: () => faker.internet.url(),
    phoneNumber: () => faker.phone.number(),
    politicalAffiliation: () => '',
    politicalAffiliationCategory: () =>
      faker.helpers.arrayElement(Object.values(DTSI_PersonPoliticalAffiliationCategory)),
    profilePictureUrl: () =>
      'https://db0prh5pvbqwd.cloudfront.net/all/images/12b0866e-c3ab-418d-8914-bc0fba709fb5.jpg',
    profilePictureUrlDimensions: () => ({
      type: 'jpg',
      width: 1363,
      height: 2048,
    }),
    slug: () => `${firstName}---${lastName}`,
    suffixName: () => faker.person.suffix(),
  }
}
