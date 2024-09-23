import { runBin } from '@/bin/runBin'
import { CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/emailWithInngest.ts
 *
 * Verify that the advocate is created in Capitol Canary with an administrator.
 * The test email may not be "sent" if the zip code and address do not match up.
 * Updating the database should fail since the mock user does not actually exist in the database.
 */

async function smokeTestEmailWithInngest() {
  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  await inngest.send({
    name: CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME,
    data: {
      campaignId: getCapitolCanaryCampaignID(
        CapitolCanaryCampaignName.DEFAULT_EMAIL_REPRESENTATIVE,
      ),
      user: {
        ...mockedUser,
        address: mockedAddress,
      },
      userEmailAddress: mockedEmailAddress,
      metadata: {
        tags: ['Smoke Test User'],
      },
      opts: {
        isEmailOptin: true,
      },
      emailSubject: 'This is a test email subject.',
      emailMessage: 'This is a test email message.',
    },
  })
}

void runBin(smokeTestEmailWithInngest)
