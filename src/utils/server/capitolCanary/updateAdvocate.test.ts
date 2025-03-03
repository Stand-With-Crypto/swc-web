import { faker } from '@faker-js/faker'
import { expect } from '@jest/globals'

import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { formatCapitolCanaryAdvocateUpdateRequest } from '@/utils/server/capitolCanary/updateAdvocate'
import { smsProvider, SMSProviders } from '@/utils/shared/smsProvider'

it('formats the "update capitol canary advocate" request correctly', () => {
  // Set the seed so that the mocked output is deterministic.
  faker.seed(1)

  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  mockedUser.capitolCanaryAdvocateId = 68251920
  mockedUser.capitolCanaryInstance = 'STAND_WITH_CRYPTO'

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

  const formattedRequest = formatCapitolCanaryAdvocateUpdateRequest(payload)

  expect(formattedRequest).toMatchInlineSnapshot(`
{
  "address1": "64601 Wellington Road",
  "address2": "Apt. 535",
  "advocateid": 68251920,
  "campaigns": [
    142628,
  ],
  "city": "Huntersville",
  "country": "US",
  "email": "Cordia12@hotmail.com",
  "emailOptin": 1,
  "emailOptout": 0,
  "firstname": "Haylie",
  "lastname": "Macejkovic",
  "p2aSource": "source",
  "phone": "+19178798306",
  "smsOptin": 1,
  "smsOptinConfirmed": 1,
  "smsOptout": 0,
  "state": "ME",
  "tags": [
    "tag1",
    "tag2",
  ],
  "utm_campaign": "utmCampaign",
  "utm_content": "utmContent",
  "utm_medium": "utmMedium",
  "utm_source": "utmSource",
  "utm_term": "utmTerm",
  "zip5": "79753",
}
`)
})
