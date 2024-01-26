import { CapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import { formatCapitolCanaryAdvocateCreationRequest } from '@/utils/server/capitolCanary/createAdvocate'
import { faker } from '@faker-js/faker'
import { mockUser } from '@/mocks/models/mockUser'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { CreateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { expect } from '@jest/globals'

it('formats the "create capitol canary advocate" request correctly', () => {
  // Set the seed so that the mocked output is deterministic.
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
  "address1": "9764 Domenico Viaduct",
  "address2": "Suite 759",
  "campaigns": [
    137795,
  ],
  "city": "East Jaquanville",
  "country": "UA",
  "email": "Edythe.Raynor@hotmail.com",
  "emailOptin": 1,
  "emailOptout": 0,
  "firstname": "Blake",
  "lastname": "Leffler",
  "p2aSource": "source",
  "phone": "+16929224505",
  "smsOptin": 1,
  "smsOptinConfirmed": 0,
  "smsOptout": 0,
  "state": "Pennsylvania",
  "tags": [
    "tag1",
    "tag2",
  ],
  "utm_campaign": "utmCampaign",
  "utm_content": "utmContent",
  "utm_medium": "utmMedium",
  "utm_source": "utmSource",
  "utm_term": "utmTerm",
  "zip5": "16402-7572",
}
`)
})
