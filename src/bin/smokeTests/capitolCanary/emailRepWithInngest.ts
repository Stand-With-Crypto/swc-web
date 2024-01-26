import { inngest } from '@/inngest/inngest'
import { SandboxCapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import { EmailRepViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { mockUser } from '@/mocks/models/mockUser'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { runBin } from '@/bin/runBin'
import { CAPITOL_CANARY_EMAIL_REP_INNGEST_EVENT_NAME } from '@/inngest/functions/emailRepViaCapitolCanary'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/emailRepWithInngest.ts
 *
 * Verify that the advocate is created in Capitol Canary with an administrator.
 * The test email may not be "sent" if the zip code and address do not match up.
 */

async function smokeTestEmailRepWithInngest() {
  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  const payload: EmailRepViaCapitolCanaryPayloadRequirements = {
    campaignId: SandboxCapitolCanaryCampaignId.DEFAULT_EMAIL_REPRESENTATIVE,
    user: {
      ...mockedUser,
      address: mockedAddress,
    },
    userEmailAddress: mockedEmailAddress,
    metadata: {
      tags: ['Smoke Test User'],
    },
    emailSubject: 'This is a test email subject.',
    emailMessage: 'This is a test email message.',
  }

  await inngest.send({
    name: CAPITOL_CANARY_EMAIL_REP_INNGEST_EVENT_NAME,
    data: payload,
  })
}

runBin(smokeTestEmailRepWithInngest)
