import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { formatCapitolCanaryAdvocateCreationRequest } from '@/utils/server/capitolCanary/createAdvocate'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { faker } from '@faker-js/faker'
import { expect } from '@jest/globals'

it('formats the "create capitol canary advocate" request correctly', () => {
  // Set the seed so that the mocked output is deterministic.
  faker.seed(1)

  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  const payload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP),
    metadata: {
      p2aSource: 'source',
      tags: ['tag1', 'tag2'],
      utmCampaign: 'utmCampaign',
      utmContent: 'utmContent',
      utmMedium: 'utmMedium',
      utmSource: 'utmSource',
      utmTerm: 'utmTerm',
    },
    opts: {
      isEmailOptin: true,
      isEmailOptout: false,
      isSmsOptin: true,
      isSmsOptout: false,
      shouldSendSmsOptinConfirmation: false,
    },
    user: {
      ...mockedUser,
      address: mockedAddress,
    },
    userEmailAddress: mockedEmailAddress,
  }

  const formattedRequest = formatCapitolCanaryAdvocateCreationRequest(payload)

  expect(formattedRequest).toMatchInlineSnapshot(`
{
  "address1": "906 Mueller Centers",
  "address2": "Apt. 890",
  "campaigns": [
    142628,
  ],
  "city": "Finnstead",
  "country": "MH",
  "email": "Johan71@hotmail.com",
  "emailOptin": 1,
  "emailOptout": 0,
  "firstname": "Zion",
  "lastname": "Watsica",
  "p2aSource": "source",
  "phone": "+13912031336",
  "smsOptin": 1,
  "smsOptinConfirmed": 1,
  "smsOptout": 0,
  "state": "West Virginia",
  "tags": [
    "tag1",
    "tag2",
  ],
  "utm_campaign": "utmCampaign",
  "utm_content": "utmContent",
  "utm_medium": "utmMedium",
  "utm_source": "utmSource",
  "utm_term": "utmTerm",
  "zip5": "32797",
}
`)
})
