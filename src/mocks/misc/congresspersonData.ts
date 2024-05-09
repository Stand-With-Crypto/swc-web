import { fakerFields } from '@/mocks/fakerUtils'

export const REAL_CONGRESSPERSON_DATA = {
  computedStanceScore: fakerFields.dtsiStanceScore(),
  firstName: 'Jerrold',
  firstNickname: 'Jerrold',
  gender: 'MALE',
  isPubliclyVisible: true,
  lastName: 'Nadler',
  manuallyOverriddenStanceScore: null,
  middleName: 'L',
  nameSuffix: '',
  nameUniquenessModifier: '',
  officialUrl: 'https://nadler.house.gov/',
  phoneNumber: '(202) 225-5635',
  politicalAffiliation: 'Democratic Party',
  politicalAffiliationCategory: 'DEMOCRAT',
  profilePictureUrl:
    'https://db0prh5pvbqwd.cloudfront.net/all/images/12b0866e-c3ab-418d-8914-bc0fba709fb5.jpg',
  profilePictureUrlDimensions: {
    type: 'jpg',
    width: 1363,
    height: 2048,
  },
  slug: `Jerrold---Nadler`,
  suffixName: '',
  stances: [0],
  primaryRole: {} as any,
}
