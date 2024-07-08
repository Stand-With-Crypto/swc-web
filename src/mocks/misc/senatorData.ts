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
    'https://db0prh5pvbqwd.cloudfront.net/all/images/12b0866e-c3ab-418d-8914-bc0fba709fb5.jpg',

  profilePictureUrlDimensions: {
    type: 'jpg',
    width: 750,
    height: 938,
  },
  slug: 'kirsten---gillibrand',
  suffixName: '',
  stances: [0],
  primaryRole: {
    dateEnd: '2023-08-25T04:21:46.127Z',
    dateStart: '2023-12-02T12:07:00.243Z',
    id: 'a14200e2-6762-4bcf-a216-2a5c3e7adcd4',
    primaryCity: '',
    primaryCountryCode: 'US',
    primaryDistrict: '',
    primaryState: '',
    roleCategory: 'SENATE',
    status: 'HELD',
    title: 'Political Figure',
  } as any,
}
