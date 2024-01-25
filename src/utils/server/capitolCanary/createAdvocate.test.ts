import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { CapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import {
  CreateAdvocateInCapitolCanaryPayloadRequirements,
  formatCapitolCanaryAdvocateCreationRequest,
} from '@/utils/server/capitolCanary/createAdvocate'
import { faker } from '@faker-js/faker'
import { expect } from '@jest/globals'

it('formats the request correctly', () => {
  faker.seed(1)
  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

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
  "address1": "5976 Armstrong Fords",
  "address2": "Suite 865",
  "campaigns": [
    137795,
  ],
  "city": "Bell Gardens",
  "country": "KG",
  "email": "Wade81@yahoo.com",
  "emailOptin": 1,
  "emailOptout": 0,
  "firstname": "Blake",
  "lastname": "Leffler",
  "p2aSource": "source",
  "phone": "+10692922450",
  "smsOptin": 1,
  "smsOptinConfirmed": 0,
  "smsOptout": 0,
  "state": "Florida",
  "tags": [
    "tag1",
    "tag2",
  ],
  "utm_campaign": "utmCampaign",
  "utm_content": "utmContent",
  "utm_medium": "utmMedium",
  "utm_source": "utmSource",
  "utm_term": "utmTerm",
  "zip5": "17916",
}
`)
})
