import { faker } from '@faker-js/faker'
import { expect } from '@jest/globals'

import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { formatCapitolCanaryAdvocateCreationRequest } from '@/utils/server/capitolCanary/createAdvocate'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'

it('formats the "create capitol canary advocate" request correctly', () => {
  // Set the seed so that the mocked output is deterministic.
  faker.seed(1)

  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  const payload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP),
    user: {
      ...mockedUser,
      address: mockedAddress,
    },
    userEmailAddress: mockedEmailAddress,
    opts: {
      isSmsOptin: true,
      shouldSendSmsOptinConfirmation: false,
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
  "address1": "164 Bins Corners",
  "address2": "Suite 904",
  "campaigns": [
    142628,
  ],
  "city": "New Trycia",
  "country": "US",
  "email": "Nicklaus_Walker51@yahoo.com",
  "emailOptin": 1,
  "emailOptout": 0,
  "firstname": "Haylie",
  "lastname": "Macejkovic",
  "p2aSource": "source",
  "phone": "+19178798306",
  "smsOptin": 0,
  "smsOptinConfirmed": 1,
  "smsOptout": 0,
  "state": "MA",
  "tags": [
    "tag1",
    "tag2",
  ],
  "utm_campaign": "utmCampaign",
  "utm_content": "utmContent",
  "utm_medium": "utmMedium",
  "utm_source": "utmSource",
  "utm_term": "utmTerm",
  "zip5": "27975",
}
`)
})
