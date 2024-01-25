import { CapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import {
  CreateAdvocateInCapitolCanaryPayloadRequirements,
  formatCapitolCanaryAdvocateCreationRequest,
} from '@/utils/server/capitolCanary/createAdvocate'
import { Address, User, UserEmailAddress } from '@prisma/client'

it('formats the request correctly', () => {
  const mockedUser: User = {
    datetimeCreated: new Date('2023-02-15T00:46:31.287Z'),
    datetimeUpdated: new Date('2023-05-05T08:11:15.602Z'),
    acquisitionCampaign: '',
    acquisitionMedium: '',
    acquisitionSource: '',
    acquisitionReferer: '',
    id: '4c7e4344-e82d-4ee5-bfef-18cfaeced49a',
    primaryUserEmailAddressId: 'd1119c30-3f6b-49d2-b508-05d55e16739d',
    primaryUserCryptoAddressId: 'caa28dc2-8444-4ec8-afb8-4daf8aafc46f',
    sampleDatabaseIncrement: 0,
    fullName: 'John Doe',
    isPubliclyVisible: true,
    phoneNumber: '1234567890',
    addressId: null,
    hasOptedInToEmails: true,
    hasOptedInToMembership: false,
    hasOptedInToSms: false,
    internalStatus: 'VISIBLE',
  }
  const mockedAddress: Address = {
    datetimeCreated: new Date('2023-03-30T13:49:18.075Z'),
    datetimeUpdated: new Date('2023-05-05T03:13:33.594Z'),
    id: 'bedbc8bb-9c4a-40f7-8c85-db82291c3484',
    googlePlaceId: '189402a5-8b3a-4e62-9029-9d44da51411b',
    streetNumber: '78231',
    route: 'Macejkovic Row',
    subpremise: 'Suite 662',
    locality: 'Considinefurt',
    administrativeAreaLevel1: 'Maryland',
    administrativeAreaLevel2: '',
    postalCode: '14511',
    postalCodeSuffix: '',
    countryCode: 'AM',
    formattedDescription: '78231 Macejkovic Row, Suite 662, Considinefurt Maryland, 14511 AM',
  }
  const mockedEmailAddress: UserEmailAddress = {
    datetimeCreated: new Date('2023-11-11T18:03:09.700Z'),
    datetimeUpdated: new Date('2023-04-25T08:52:38.784Z'),
    id: 'e696cc7e-c224-48b4-86df-b1abcbcd08e2',
    emailAddress: 'Hellen_Durgan75@yahoo.com',
    source: 'VERIFIED_THIRD_PARTY',
    isVerified: true,
    userId: 'c74bcb72-4e6b-455d-8be7-a04260c74451',
  }

  const payload: CreateAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId: CapitolCanaryCampaignId.TESTING,
    user: {
      ...mockedUser,
      address: mockedAddress,
      primaryUserEmailAddress: mockedEmailAddress,
    },
    opts: {
      isSmsOptin: true,
      isSmsOptinConfirmed: false,
      isSmsOptout: false,
      isEmailOptin: true,
      isEmailOptout: false,
    },
    metadata: {
      p2aSource: 'source',
      utmSource: 'utmSource',
      utmMedium: 'utmMedium',
      utmCampaign: 'utmCampaign',
      utmTerm: 'utmTerm',
      utmContent: 'utmContent',
      tags: ['tag1', 'tag2'],
    },
  }

  const formattedRequest = formatCapitolCanaryAdvocateCreationRequest(payload)

  expect(formattedRequest).toMatchInlineSnapshot(`
{
  "address1": "78231 Macejkovic Row",
  "address2": "Suite 662",
  "campaigns": [
    137795,
  ],
  "city": "Considinefurt",
  "country": "AM",
  "email": "Hellen_Durgan75@yahoo.com",
  "emailOptin": 1,
  "emailOptout": 0,
  "p2aSource": "source",
  "phone": "1234567890",
  "smsOptin": 1,
  "smsOptinConfirmed": 0,
  "smsOptout": 0,
  "state": "Maryland",
  "tags": [
    "tag1",
    "tag2",
  ],
  "utm_campaign": "utmCampaign",
  "utm_content": "utmContent",
  "utm_medium": "utmMedium",
  "utm_source": "utmSource",
  "utm_term": "utmTerm",
  "zip5": "14511",
}
`)
})
