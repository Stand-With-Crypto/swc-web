import { inngest } from '@/inngest/inngest'
import { CapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import { CreateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/createAdvocateInCapitolCanary'
import { mockUser } from '@/mocks/models/mockUser'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { runBin } from '@/bin/runBin'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/createAdvocateWithInngest.ts
 *
 * Verify that the advocate is created in Capitol Canary with an administrator.
 */

async function smokeTestCreateAdvocateWithInngest() {
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
      isEmailOptin: true,
    },
    metadata: {
      tags: ['Smoke Test User'],
    },
  }

  await inngest.send({
    name: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME,
    data: payload,
  })
}

runBin(smokeTestCreateAdvocateWithInngest)
