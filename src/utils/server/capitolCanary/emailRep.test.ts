import { faker } from '@faker-js/faker'
import { expect } from '@jest/globals'

import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { formatCapitolCanaryEmailRepRequest } from '@/utils/server/capitolCanary/emailRep'
import { EmailRepViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'

it('formats the "email rep via capitol canary" request correctly', () => {
  // Set the seed so that the mocked output is deterministic.
  faker.seed(1)

  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  const payload: EmailRepViaCapitolCanaryPayloadRequirements = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_EMAIL_REPRESENTATIVE),
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
    emailMessage: 'This is a test email message.',
    emailSubject: 'This is a test email subject.',
  }

  const formattedRequest = formatCapitolCanaryEmailRepRequest({ ...payload, advocateId: 123456 })

  expect(formattedRequest).toMatchInlineSnapshot(`
{
  "advocateid": 123456,
  "campaignid": 142630,
  "emailMessage": "This is a test email message.",
  "emailSubject": "This is a test email subject.",
  "p2aSource": "source",
  "type": [
    "email",
  ],
  "utm_campaign": "utmCampaign",
  "utm_content": "utmContent",
  "utm_medium": "utmMedium",
  "utm_source": "utmSource",
  "utm_term": "utmTerm",
}
`)
})
