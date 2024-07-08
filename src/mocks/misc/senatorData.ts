import { fakerFields } from '@/mocks/fakerUtils'

export const REAL_SENATOR_DATA = {
  computedStanceScore: fakerFields.dtsiStanceScore(),
  firstName: 'Kirsten',
  firstNickname: 'Kirsten',
  gender: 'FEMALE',
  isPubliclyVisible: true,
  lastName: 'Gillibrand',
  manuallyOverriddenStanceScore: null,
  middleName: 'E.',
  nameSuffix: '',
  nameUniquenessModifier: '',
  officialUrl: 'https://www.gillibrand.senate.gov/',
  phoneNumber: '(202) 224-4451',
  politicalAffiliation: 'Democratic Party',
  politicalAffiliationCategory: 'DEMOCRAT',
  profilePictureUrl:
    'https://db0prh5pvbqwd.cloudfront.net/all/images/c748972e-26bd-4c18-91e4-375c2f49a168.jpg',

  profilePictureUrlDimensions: {
    type: 'jpg',
    width: 750,
    height: 938,
  },
  slug: 'kirsten---gillibrand',
  suffixName: '',
  stances: [0],
  primaryRole: {} as any,
}
